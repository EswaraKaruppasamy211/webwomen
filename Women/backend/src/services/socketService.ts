import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { EmergencyIncident, LocationUpdate, SafetyReport } from '../types';
import { verifyToken } from '../utils/security';

export class SocketService {
  private io: SocketIOServer | null = null;

  public init(httpServer: HTTPServer, allowedOrigin: string): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: allowedOrigin === '*' ? true : [allowedOrigin, 'http://localhost:3000', 'http://127.0.0.1:3000'],
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 30000,
      pingInterval: 10000,
    });

    this.io.on('connection', (socket: Socket) => {
      // Authenticate socket handshake if token provided
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      let user: { id: string; email: string; role: string } | null = null;

      if (token && typeof token === 'string') {
        try {
          user = verifyToken(token);
          socket.data.user = user;
          // If admin, join admin room
          if (user.role === 'ADMIN') {
            socket.join('room:admins');
            console.log(`🛡️ Admin connected to real-time feed: ${user.email} (socket ${socket.id})`);
          }
          // Join user's personal room
          socket.join(`user:${user.id}`);
        } catch {
          // Allow anonymous socket for public demo or map views
        }
      }

      // Allow joining specific incident room for live streaming
      socket.on('incident:join', (incidentId: string) => {
        socket.join(`incident:${incidentId}`);
      });

      socket.on('incident:leave', (incidentId: string) => {
        socket.leave(`incident:${incidentId}`);
      });

      socket.on('admin:join', () => {
        socket.join('room:admins');
      });

      socket.on('disconnect', () => {
        // Disconnected
      });
    });

    console.log('⚡ Socket.IO real-time engine initialized.');
    return this.io;
  }

  public notifyNewEmergency(incident: EmergencyIncident): void {
    if (!this.io) return;
    // Broadcast immediately to all connected administrators
    this.io.to('room:admins').emit('emergency:new', {
      incident,
      alertSound: true,
      priority: 'CRITICAL_ALARM',
      timestamp: new Date().toISOString(),
    });

    // Also broadcast to public map viewers / user room
    this.io.to(`incident:${incident.id}`).emit('emergency:created', incident);
    this.io.emit('emergency:stream', { action: 'NEW_INCIDENT', incident });
  }

  public notifyLocationUpdate(incidentId: string, location: LocationUpdate): void {
    if (!this.io) return;
    // Broadcast live GPS update to admins and incident room
    this.io.to('room:admins').emit('emergency:location_update', {
      incidentId,
      location,
    });
    this.io.to(`incident:${incidentId}`).emit('emergency:location_update', location);
  }

  public notifyIncidentStatusChange(incident: EmergencyIncident, previousStatus?: string): void {
    if (!this.io) return;
    this.io.to('room:admins').emit('emergency:status_change', {
      incident,
      previousStatus,
    });
    this.io.to(`incident:${incident.id}`).emit('emergency:status_change', incident);
    this.io.to(`user:${incident.userId}`).emit('emergency:user_status_update', incident);
  }

  public notifyNewSafetyReport(report: SafetyReport): void {
    if (!this.io) return;
    this.io.to('room:admins').emit('report:new', report);
  }

  public notifySafetyReportStatusChange(report: SafetyReport): void {
    if (!this.io) return;
    this.io.emit('report:status_change', report);
  }

  public notifyCheckinEscalation(checkinId: string, alertData: any): void {
    if (!this.io) return;
    this.io.to('room:admins').emit('checkin:escalated', {
      checkinId,
      alertData,
      priority: 'WARNING',
    });
  }
}

export const socketService = new SocketService();
