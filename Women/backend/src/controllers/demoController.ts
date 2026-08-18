import { Request, Response } from 'express';
import { db } from '../db/database';
import { socketService } from '../services/socketService';
import { v4 as uuidv4 } from 'uuid';

export class DemoController {
  public async simulateSOS(req: Request, res: Response): Promise<void> {
    try {
      const demoUserId = 'usr_demo_001';
      const user = db.getUserById(demoUserId) || db.getUsers()[0];

      // Simulated starting point: Downtown Civic Center
      const baseLat = 37.7749;
      const baseLng = -122.4194;

      // Create simulated incident
      const demoIncident = await db.createIncident({
        userId: user.id,
        userName: `${user.name} [DEMO SIMULATION]`,
        userPhone: '+1-555-014-8832',
        latitude: baseLat,
        longitude: baseLng,
        accuracy: 12.5,
        address: '788 Market St [DEMO SIMULATED LOCATION]',
        status: 'NEW',
        isDemo: true,
        notes: 'SIMULATED DEMONSTRATION SOS INCIDENT',
      });

      // Add initial location
      await db.addLocationUpdate({
        incidentId: demoIncident.id,
        latitude: baseLat,
        longitude: baseLng,
        accuracy: 12.5,
        speed: 1.2,
        heading: 45,
        batteryLevel: 88,
        timestamp: new Date().toISOString(),
      });

      // Simulated verified notifications
      const simNotifications = [
        {
          contactId: 'cnt_001',
          contactName: 'Elena Jenkins (Mother)',
          channel: 'SMS' as const,
          destination: '+1-555-019-4481',
          status: 'QUEUED' as const,
          deliveryId: `demo_sms_${uuidv4().substring(0, 8)}`,
          timestamp: new Date().toISOString(),
          messagePreview: `[DEMO ALERT] SOS triggered for Sarah Jenkins at 788 Market St. Live track: /app/sos?incidentId=${demoIncident.id}`,
        },
        {
          contactId: 'cnt_002',
          contactName: 'Marcus Vance (Brother)',
          channel: 'SMS' as const,
          destination: '+1-555-018-9922',
          status: 'QUEUED' as const,
          deliveryId: `demo_sms_${uuidv4().substring(0, 8)}`,
          timestamp: new Date().toISOString(),
          messagePreview: `[DEMO ALERT] SOS triggered for Sarah Jenkins at 788 Market St. Live track: /app/sos?incidentId=${demoIncident.id}`,
        },
      ];

      const updated = await db.updateIncident(demoIncident.id, {
        contactNotifications: simNotifications,
      });

      // Broadcast real-time Socket.IO alert
      socketService.notifyNewEmergency(updated!);

      await db.createAuditLog({
        actorId: user.id,
        actorName: `${user.name} (Demo)`,
        actorRole: 'USER',
        action: 'DEMO_SOS_SIMULATION',
        incidentId: demoIncident.id,
        details: 'Simulated SOS demonstration incident spawned with live GPS & notification traces.',
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Demo SOS simulation launched.',
        incident: updated,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to launch demo simulation.' });
    }
  }

  public async simulateMovement(req: Request, res: Response): Promise<void> {
    try {
      const { incidentId } = req.body;
      const incident = db.getIncidentById(incidentId);

      if (!incident) {
        res.status(404).json({ success: false, message: 'Incident not found.' });
        return;
      }

      // Add a slight random GPS delta (~30 meters in random direction)
      const latDelta = (Math.random() - 0.5) * 0.0006;
      const lngDelta = (Math.random() - 0.5) * 0.0006;

      const newLat = incident.latitude + latDelta;
      const newLng = incident.longitude + lngDelta;

      await db.updateIncident(incidentId, {
        latitude: newLat,
        longitude: newLng,
      });

      const locUpdate = await db.addLocationUpdate({
        incidentId,
        latitude: newLat,
        longitude: newLng,
        accuracy: 8 + Math.random() * 6,
        speed: 1.1 + Math.random() * 0.5,
        heading: Math.floor(Math.random() * 360),
        batteryLevel: 85,
        timestamp: new Date().toISOString(),
      });

      socketService.notifyLocationUpdate(incidentId, locUpdate);

      res.json({
        success: true,
        message: 'Simulated movement step emitted.',
        location: locUpdate,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to simulate movement step.' });
    }
  }

  public async resetDemo(req: Request, res: Response): Promise<void> {
    try {
      await db.seedInitialData();
      res.json({
        success: true,
        message: 'Demo database reset to clean demonstration state.',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to reset demo data.' });
    }
  }
}

export const demoController = new DemoController();
