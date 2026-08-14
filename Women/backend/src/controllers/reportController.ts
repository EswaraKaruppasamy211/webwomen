import { Response } from 'express';
import { z } from 'zod';
import { db } from '../db/database';
import { AuthenticatedRequest } from '../middleware/auth';
import { socketService } from '../services/socketService';

const CreateReportSchema = z.object({
  category: z.enum([
    'POOR_LIGHTING',
    'HARASSMENT',
    'ISOLATED_AREA',
    'SUSPICIOUS_ACTIVITY',
    'UNSAFE_TRANSIT',
    'ROAD_OBSTRUCTION',
    'OTHER',
  ]),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(5, 'Please provide a descriptive explanation'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional().default('Pinned Map Location'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional().default('MEDIUM'),
});

export class ReportController {
  public async getReports(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const status = req.query.status as string;
      const reports = db.getReports(status);
      res.json({ success: true, count: reports.length, reports });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve safety reports.' });
    }
  }

  public async getApprovedReports(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const reports = db.getApprovedReports();
      res.json({ success: true, count: reports.length, reports });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve community hazard reports.' });
    }
  }

  public async createReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = CreateReportSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, message: parsed.error.errors[0].message });
        return;
      }

      const { category, title, description, latitude, longitude, address, severity } = parsed.data;
      const user = req.user!;

      const newReport = await db.createReport({
        userId: user.id,
        userName: user.name,
        category,
        title,
        description,
        latitude,
        longitude,
        address,
        status: user.role === 'ADMIN' ? 'APPROVED' : 'PENDING', // Auto-approve admin submissions
        severity,
      });

      socketService.notifyNewSafetyReport(newReport);

      await db.createAuditLog({
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: 'SAFETY_REPORT_FILED',
        details: `Safety report filed for ${category} at ${address}: "${title}"`,
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message:
          user.role === 'ADMIN'
            ? 'Safety report published to map.'
            : 'Thank you for contributing! Your safety report has been submitted for moderation.',
        report: newReport,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to submit safety report.' });
    }
  }

  public async moderateReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body; // 'APPROVED' | 'REJECTED'

      if (!['APPROVED', 'REJECTED'].includes(status)) {
        res.status(400).json({ success: false, message: 'Invalid status. Must be APPROVED or REJECTED.' });
        return;
      }

      const report = db.getReportById(id);
      if (!report) {
        res.status(404).json({ success: false, message: 'Safety report not found.' });
        return;
      }

      const updated = await db.updateReport(id, {
        status,
        moderatedAt: new Date().toISOString(),
        moderatedBy: req.user!.id,
      });

      socketService.notifySafetyReportStatusChange(updated!);

      await db.createAuditLog({
        actorId: req.user!.id,
        actorName: req.user!.name,
        actorRole: req.user!.role,
        action: `REPORT_MODERATED_${status}`,
        details: `Report ${id} moderated to ${status} by admin`,
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        message: `Report status updated to ${status}.`,
        report: updated,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to moderate report.' });
    }
  }

  public async deleteReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await db.deleteReport(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Report not found.' });
        return;
      }
      res.json({ success: true, message: 'Safety report deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to delete report.' });
    }
  }
}

export const reportController = new ReportController();
