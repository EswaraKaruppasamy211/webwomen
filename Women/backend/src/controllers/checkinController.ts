import { Response } from 'express';
import { z } from 'zod';
import { db } from '../db/database';
import { AuthenticatedRequest } from '../middleware/auth';
import { notificationService } from '../services/notificationService';

const StartCheckinSchema = z.object({
  durationMinutes: z.number().min(1).max(720), // 1 min to 12 hours
  destination: z.string().min(2, 'Please specify your destination or activity'),
  initialLat: z.number().optional(),
  initialLng: z.number().optional(),
  contactIds: z.array(z.string()).optional().default([]),
});

export class CheckinController {
  public async getActiveCheckin(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const checkin = db.getActiveCheckinByUserId(req.user!.id);
      res.json({
        success: true,
        hasActiveCheckin: !!checkin,
        checkin: checkin || null,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to check active timer.' });
    }
  }

  public async startCheckin(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = StartCheckinSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, message: parsed.error.errors[0].message });
        return;
      }

      const { durationMinutes, destination, initialLat, initialLng, contactIds } = parsed.data;
      const user = req.user!;

      // Cancel any prior active check-ins for this user
      const existing = db.getActiveCheckinByUserId(user.id);
      if (existing) {
        await db.updateCheckin(existing.id, { status: 'CANCELLED' });
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + durationMinutes * 60000).toISOString();

      const newCheckin = await db.createCheckin({
        userId: user.id,
        userName: user.name,
        durationMinutes,
        expiresAt,
        destination,
        initialLat,
        initialLng,
        status: 'ACTIVE',
        contactIds,
      });

      await db.createAuditLog({
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: 'CHECKIN_TIMER_STARTED',
        details: `Safety check-in timer set for ${durationMinutes} mins. Destination: "${destination}". Expires at ${expiresAt}`,
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: `Safety check-in active. We will verify your safety in ${durationMinutes} minutes.`,
        checkin: newCheckin,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to start safety check-in.' });
    }
  }

  public async confirmSafe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const checkin = db.getCheckins().find((c) => c.id === id);

      if (!checkin || checkin.userId !== req.user!.id) {
        res.status(404).json({ success: false, message: 'Check-in timer not found.' });
        return;
      }

      const updated = await db.updateCheckin(id, {
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
      });

      await db.createAuditLog({
        actorId: req.user!.id,
        actorName: req.user!.name,
        actorRole: req.user!.role,
        action: 'CHECKIN_CONFIRMED_SAFE',
        details: `User confirmed safe arrival for check-in ${id} to "${checkin.destination}"`,
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        message: 'Safety confirmed! Glad you arrived safely.',
        checkin: updated,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to confirm safety.' });
    }
  }

  public async cancelCheckin(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const checkin = db.getCheckins().find((c) => c.id === id);

      if (!checkin || checkin.userId !== req.user!.id) {
        res.status(404).json({ success: false, message: 'Check-in timer not found.' });
        return;
      }

      const updated = await db.updateCheckin(id, {
        status: 'CANCELLED',
      });

      res.json({
        success: true,
        message: 'Safety check-in timer cancelled.',
        checkin: updated,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to cancel check-in.' });
    }
  }
}

export const checkinController = new CheckinController();
