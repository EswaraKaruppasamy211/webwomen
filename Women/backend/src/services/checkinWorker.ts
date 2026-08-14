import { db } from '../db/database';
import { notificationService } from './notificationService';
import { socketService } from './socketService';

export class CheckinWorker {
  private intervalTimer: NodeJS.Timeout | null = null;

  public start(intervalMs = 30000): void {
    if (this.intervalTimer) return;
    this.intervalTimer = setInterval(() => this.evaluateCheckins(), intervalMs);
    console.log('⏰ Safety Check-In background escalation worker started.');
  }

  public stop(): void {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }

  public async evaluateCheckins(): Promise<void> {
    const activeCheckins = db.getActiveCheckins();
    const now = new Date().getTime();

    for (const checkin of activeCheckins) {
      const expiry = new Date(checkin.expiresAt).getTime();
      if (now > expiry) {
        console.warn(`⚠️ Safety Check-In EXPIRED without safety confirmation: ${checkin.id} (User: ${checkin.userName})`);

        // Escalate status
        await db.updateCheckin(checkin.id, {
          status: 'ESCALATED',
          escalatedAt: new Date().toISOString(),
        });

        const userContacts = db.getContactsByUserId(checkin.userId);
        const contactsToNotify = userContacts.filter(
          (c) => checkin.contactIds.length === 0 || checkin.contactIds.includes(c.id)
        );

        // Dispatch notifications
        await notificationService.dispatchCheckinEscalation({
          checkinId: checkin.id,
          userName: checkin.userName,
          destination: checkin.destination,
          contacts: contactsToNotify,
        });

        // Notify admins via Socket.IO
        socketService.notifyCheckinEscalation(checkin.id, {
          userId: checkin.userId,
          userName: checkin.userName,
          destination: checkin.destination,
          expiredAt: checkin.expiresAt,
        });

        // Audit log
        await db.createAuditLog({
          actorId: 'SYSTEM',
          actorName: 'Checkin Escalation Worker',
          actorRole: 'SYSTEM',
          action: 'CHECKIN_AUTO_ESCALATED',
          details: `Check-in ${checkin.id} expired for ${checkin.userName}. Emergency contacts notified.`,
        });
      }
    }
  }
}

export const checkinWorker = new CheckinWorker();
