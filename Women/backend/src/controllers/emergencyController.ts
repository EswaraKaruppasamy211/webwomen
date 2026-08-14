import { Response } from 'express';
import { z } from 'zod';
import { db } from '../db/database';
import { AuthenticatedRequest } from '../middleware/auth';
import { socketService } from '../services/socketService';
import { notificationService } from '../services/notificationService';
import { IncidentStatus } from '../types';

const CreateIncidentSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0),
  address: z.string().optional().default('Current GPS Location'),
  isDemo: z.boolean().optional().default(false),
});

const LocationUpdateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0),
  speed: z.number().optional(),
  heading: z.number().optional(),
  batteryLevel: z.number().optional(),
});

const UpdateStatusSchema = z.object({
  status: z.enum(['NEW', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED']),
  notes: z.string().optional(),
});

export class EmergencyController {
  public async createIncident(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const parsed = CreateIncidentSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, message: parsed.error.errors[0].message });
        return;
      }

      const { latitude, longitude, accuracy, address, isDemo } = parsed.data;

      // Check if user already has an active emergency (prevent duplicate spamming)
      const existingActive = db.getActiveIncidentByUserId(user.id);
      if (existingActive) {
        // Return existing active incident rather than creating duplicate
        res.status(200).json({
          success: true,
          message: 'Active emergency incident already exists.',
          incident: existingActive,
          isExisting: true,
        });
        return;
      }

      // Fetch user's verified emergency contacts
      const contacts = db.getContactsByUserId(user.id);

      // Create new incident in database
      const newIncident = await db.createIncident({
        userId: user.id,
        userName: user.name,
        userPhone: user.phone || 'Unknown Phone',
        latitude,
        longitude,
        accuracy,
        address,
        status: 'NEW',
        isDemo,
      });

      // Add initial location update
      await db.addLocationUpdate({
        incidentId: newIncident.id,
        latitude,
        longitude,
        accuracy,
        timestamp: new Date().toISOString(),
      });

      // Dispatch confirmed notifications to emergency contacts
      const notificationLogs = await notificationService.dispatchEmergencyAlerts({
        incidentId: newIncident.id,
        userName: user.name,
        userPhone: user.phone || '',
        latitude,
        longitude,
        address,
        timestamp: newIncident.startedAt,
        contacts,
      });

      // Update incident with notification delivery logs
      const updatedIncident = (await db.updateIncident(newIncident.id, {
        contactNotifications: notificationLogs,
      }))!;

      // Broadcast real-time Socket.IO alert to Admin command center
      socketService.notifyNewEmergency(updatedIncident);

      // Record in Audit Log
      await db.createAuditLog({
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: 'EMERGENCY_SOS_TRIGGERED',
        incidentId: newIncident.id,
        details: `SOS triggered at ${address} (${latitude.toFixed(4)}, ${longitude.toFixed(4)}). Notified ${notificationLogs.length} contacts.`,
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Emergency SOS activated and response teams alerted.',
        incident: updatedIncident,
      });
    } catch (err: any) {
      console.error('Failed to create emergency incident:', err);
      res.status(500).json({ success: false, message: 'Failed to initiate emergency response.' });
    }
  }

  public async addLocationUpdate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const parsed = LocationUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, message: parsed.error.errors[0].message });
        return;
      }

      const incident = db.getIncidentById(id);
      if (!incident) {
        res.status(404).json({ success: false, message: 'Incident not found' });
        return;
      }

      // If incident is resolved or cancelled, stop location updates
      if (['RESOLVED', 'CANCELLED'].includes(incident.status)) {
        res.status(400).json({ success: false, message: 'Incident is already resolved/cancelled.' });
        return;
      }

      const { latitude, longitude, accuracy, speed, heading, batteryLevel } = parsed.data;

      // Update incident's current coordinates
      await db.updateIncident(id, {
        latitude,
        longitude,
        accuracy,
      });

      // Record location breadcrumb in history
      const location = await db.addLocationUpdate({
        incidentId: id,
        latitude,
        longitude,
        accuracy,
        speed,
        heading,
        batteryLevel,
        timestamp: new Date().toISOString(),
      });

      // Stream live GPS coordinates via Socket.IO
      socketService.notifyLocationUpdate(id, location);

      res.json({
        success: true,
        location,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to record location update.' });
    }
  }

  public async getIncident(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const incident = db.getIncidentById(id);
      if (!incident) {
        res.status(404).json({ success: false, message: 'Incident not found' });
        return;
      }

      // Check authorization (must be admin or incident owner)
      if (req.user?.role !== 'ADMIN' && incident.userId !== req.user?.id) {
        res.status(403).json({ success: false, message: 'Unauthorized access to this incident.' });
        return;
      }

      const locationUpdates = db.getLocationUpdates(id);

      res.json({
        success: true,
        incident,
        locationUpdates,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve incident details.' });
    }
  }

  public async getActiveIncident(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const incident = db.getActiveIncidentByUserId(user.id);
      if (!incident) {
        res.json({ success: true, active: false, incident: null });
        return;
      }

      const locationUpdates = db.getLocationUpdates(incident.id);

      res.json({
        success: true,
        active: true,
        incident,
        locationUpdates,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to check active incident.' });
    }
  }

  public async updateStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const parsed = UpdateStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, message: parsed.error.errors[0].message });
        return;
      }

      const incident = db.getIncidentById(id);
      if (!incident) {
        res.status(404).json({ success: false, message: 'Incident not found' });
        return;
      }

      const { status, notes } = parsed.data;
      const previousStatus = incident.status;
      const now = new Date().toISOString();

      // Only owner can CANCEL; only Admin can ACKNOWLEDGE / set IN_PROGRESS / RESOLVE
      if (req.user?.role !== 'ADMIN' && status !== 'CANCELLED') {
        res.status(403).json({
          success: false,
          message: 'Only dispatchers/admins can update status to ' + status,
        });
        return;
      }

      const updates: Partial<typeof incident> = {
        status: status as IncidentStatus,
        notes: notes || incident.notes,
      };

      if (status === 'ACKNOWLEDGED' && !incident.acknowledgedAt) {
        updates.acknowledgedAt = now;
      } else if (status === 'RESOLVED') {
        updates.resolvedAt = now;
      } else if (status === 'CANCELLED') {
        updates.cancelledAt = now;
      }

      const updatedIncident = (await db.updateIncident(id, updates))!;

      // Broadcast status change over Socket.IO
      socketService.notifyIncidentStatusChange(updatedIncident, previousStatus);

      // Audit log
      await db.createAuditLog({
        actorId: req.user!.id,
        actorName: req.user!.name,
        actorRole: req.user!.role,
        action: `EMERGENCY_STATUS_${status}`,
        incidentId: id,
        details: `Status transitioned from ${previousStatus} to ${status}. Notes: ${notes || 'None'}`,
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        message: `Incident status updated to ${status}.`,
        incident: updatedIncident,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update emergency status.' });
    }
  }

  public async getAllIncidents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const status = req.query.status as string;
      let incidents = db.getIncidents();

      if (status && status !== 'ALL') {
        incidents = incidents.filter((i) => i.status === status);
      }

      res.json({
        success: true,
        count: incidents.length,
        incidents,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch incidents.' });
    }
  }
}

export const emergencyController = new EmergencyController();
