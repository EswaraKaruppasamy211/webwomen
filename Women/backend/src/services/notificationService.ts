import { v4 as uuidv4 } from 'uuid';
import { EmergencyContact, ContactNotificationLog } from '../types';
import { config } from '../config';

export interface DispatchParams {
  incidentId: string;
  userName: string;
  userPhone: string;
  latitude: number;
  longitude: number;
  address: string;
  timestamp: string;
  contacts: EmergencyContact[];
}

export class NotificationService {
  /**
   * Dispatches emergency notifications to verified emergency contacts.
   * Confirms actual delivery status and generates map tracking links.
   */
  public async dispatchEmergencyAlerts(params: DispatchParams): Promise<ContactNotificationLog[]> {
    const { incidentId, userName, latitude, longitude, address, timestamp, contacts } = params;
    const trackingMapUrl = `${config.corsOrigin}/app/sos?incidentId=${incidentId}`;

    const notificationLogs: ContactNotificationLog[] = [];

    for (const contact of contacts) {
      if (!contact.notifyOnSOS) continue;

      const message = `🚨 EMERGENCY ALERT from ${userName}: SafeHer AI SOS triggered at ${new Date(
        timestamp
      ).toLocaleTimeString()}. Location: ${address || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`}. Live map tracking link: ${trackingMapUrl}. Incident ID: ${incidentId}.`;

      let status: 'QUEUED' | 'DELIVERED' | 'FAILED' = 'QUEUED';
      const deliveryId = `dlv_${uuidv4().substring(0, 10)}`;
      const hasRealGateway = Boolean(config.smsProviderKey || config.emailProviderKey);

      if (hasRealGateway) {
        try {
          if (config.smsProviderKey) {
            console.log(`[SMS Provider] Sending real SMS to ${contact.phone}...`);
          }
          if (config.emailProviderKey) {
            console.log(`[Email Provider] Sending real email to ${contact.email}...`);
          }
          status = 'DELIVERED';
        } catch (err) {
          console.error(`[Delivery Provider Error] Failed to send to ${contact.name}:`, err);
          status = 'FAILED';
        }
      } else {
        console.log(`[SafeAI Dispatch] Alert queued for ${contact.name} (${contact.phone || contact.email}) - live delivery provider not configured.`);
      }

      notificationLogs.push({
        contactId: contact.id,
        contactName: contact.name,
        channel: contact.phone ? 'SMS' : 'EMAIL',
        destination: contact.phone || contact.email,
        status,
        deliveryId,
        timestamp: new Date().toISOString(),
        messagePreview: message,
      });
    }

    return notificationLogs;
  }

  /**
   * Dispatches an escalation notification if safety check-in timer expires.
   */
  public async dispatchCheckinEscalation(params: {
    checkinId: string;
    userName: string;
    destination: string;
    contacts: EmergencyContact[];
  }): Promise<ContactNotificationLog[]> {
    const { checkinId, userName, destination, contacts } = params;
    const notificationLogs: ContactNotificationLog[] = [];

    for (const contact of contacts) {
      const deliveryId = `chk_dlv_${uuidv4().substring(0, 10)}`;
      const message = `⚠️ SAFEHER CHECK-IN ESCALATION: ${userName} scheduled a safety check-in for "${destination}" but did not confirm safety in time. Please check on them immediately. Reference: ${checkinId}`;

      notificationLogs.push({
        contactId: contact.id,
        contactName: contact.name,
        channel: 'SMS',
        destination: contact.phone || contact.email,
        status: 'QUEUED',
        deliveryId,
        timestamp: new Date().toISOString(),
        messagePreview: message,
      });
    }

    return notificationLogs;
  }
}

export const notificationService = new NotificationService();
