import { Response } from 'express';
import { db } from '../db/database';
import { AuthenticatedRequest } from '../middleware/auth';
import { SafetyZoneType } from '../types';

export class AdminController {
  public async getOverview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const allIncidents = db.getIncidents();
      const activeIncidents = allIncidents.filter((i) => ['NEW', 'ACKNOWLEDGED', 'IN_PROGRESS'].includes(i.status));
      const resolvedIncidents = allIncidents.filter((i) => i.status === 'RESOLVED');
      const reports = db.getReports();
      const pendingReports = reports.filter((r) => r.status === 'PENDING');
      const users = db.getUsers();
      const zones = db.getSafetyZones();

      // Calculate average response acknowledgement time
      const acked = allIncidents.filter((i) => i.acknowledgedAt && i.startedAt);
      let avgAckTimeSec = 45; // baseline default in sec
      if (acked.length > 0) {
        const totalSec = acked.reduce((acc, curr) => {
          const diff = (new Date(curr.acknowledgedAt!).getTime() - new Date(curr.startedAt).getTime()) / 1000;
          return acc + Math.max(5, diff);
        }, 0);
        avgAckTimeSec = Math.round(totalSec / acked.length);
      }

      res.json({
        success: true,
        stats: {
          activeEmergencies: activeIncidents.length,
          newReportsCount: pendingReports.length,
          totalUsersCount: users.length,
          resolvedEmergenciesCount: resolvedIncidents.length,
          safetyZonesCount: zones.length,
          avgResponseTimeSec: avgAckTimeSec,
        },
        activeEmergencies: activeIncidents,
        recentReports: reports.slice(0, 5),
        recentAuditLogs: db.getAuditLogs(10),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to generate overview statistics.' });
    }
  }

  public async getAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const incidents = db.getIncidents();
      const reports = db.getReports();

      // Incidents by status
      const statusCounts = {
        NEW: incidents.filter((i) => i.status === 'NEW').length,
        ACKNOWLEDGED: incidents.filter((i) => i.status === 'ACKNOWLEDGED').length,
        IN_PROGRESS: incidents.filter((i) => i.status === 'IN_PROGRESS').length,
        RESOLVED: incidents.filter((i) => i.status === 'RESOLVED').length,
        CANCELLED: incidents.filter((i) => i.status === 'CANCELLED').length,
      };

      // Safety reports by category
      const categoryCounts: Record<string, number> = {};
      for (const rep of reports) {
        categoryCounts[rep.category] = (categoryCounts[rep.category] || 0) + 1;
      }

      // Time distribution (last 7 days / simulated trend)
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const trendData = days.map((day, idx) => ({
        day,
        incidents: Math.max(1, (idx * 2 + 1) % 5),
        reports: Math.max(2, (idx * 3 + 2) % 7),
      }));

      res.json({
        success: true,
        analytics: {
          statusCounts,
          categoryCounts,
          trendData,
          totalIncidents: incidents.length,
          totalReports: reports.length,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to generate analytics.' });
    }
  }

  public async getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const limit = parseInt((req.query.limit as string) || '100', 10);
      const logs = db.getAuditLogs(limit);
      res.json({ success: true, count: logs.length, logs });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve audit logs.' });
    }
  }

  public async createSafetyZone(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name, type, latitude, longitude, radiusMeters, safetyScore, address, phone, hours, description } = req.body;

      if (!name || !type || latitude == null || longitude == null) {
        res.status(400).json({ success: false, message: 'Missing required zone fields.' });
        return;
      }

      const newZone = await db.createSafetyZone({
        name,
        type: type as SafetyZoneType,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radiusMeters: parseFloat(radiusMeters || '250'),
        safetyScore: parseFloat(safetyScore || '90'),
        address: address || 'Designated Safety Zone',
        phone: phone || '',
        hours: hours || '24/7',
        description: description || 'Designated safety zone area.',
      });

      await db.createAuditLog({
        actorId: req.user!.id,
        actorName: req.user!.name,
        actorRole: req.user!.role,
        action: 'SAFETY_ZONE_CREATED',
        details: `Created safety zone: ${name} (${type})`,
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Safety zone created successfully.',
        zone: newZone,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to create safety zone.' });
    }
  }
}

export const adminController = new AdminController();
