import { io, Socket } from 'socket.io-client';
import { EmergencyIncident, LocationUpdate, SafetyReport } from '../types';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

class SocketClient {
  private socket: Socket | null = null;
  private token: string | null = null;

  public connect(token?: string | null): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    this.token = token || (typeof window !== 'undefined' ? localStorage.getItem('safeher_token') : null);

    this.socket = io(SOCKET_URL, {
      auth: { token: this.token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log('⚡ Connected to SafeHer AI real-time dispatch network.');
    });

    this.socket.on('connect_error', (err) => {
      console.warn('Real-time connection warning (polling fallback active):', err.message);
    });

    return this.socket;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public joinIncident(incidentId: string) {
    if (this.socket) {
      this.socket.emit('incident:join', incidentId);
    }
  }

  public leaveIncident(incidentId: string) {
    if (this.socket) {
      this.socket.emit('incident:leave', incidentId);
    }
  }

  public joinAdminRoom() {
    if (this.socket) {
      this.socket.emit('admin:join');
    }
  }

  public onEmergencyNew(callback: (data: { incident: EmergencyIncident; alertSound?: boolean }) => void) {
    this.socket?.on('emergency:new', callback);
    return () => {
      this.socket?.off('emergency:new', callback);
    };
  }

  public onLocationUpdate(callback: (data: { incidentId: string; location: LocationUpdate } | LocationUpdate) => void) {
    this.socket?.on('emergency:location_update', callback);
    return () => {
      this.socket?.off('emergency:location_update', callback);
    };
  }

  public onStatusChange(callback: (incident: EmergencyIncident) => void) {
    this.socket?.on('emergency:status_change', callback);
    this.socket?.on('emergency:user_status_update', callback);
    return () => {
      this.socket?.off('emergency:status_change', callback);
      this.socket?.off('emergency:user_status_update', callback);
    };
  }

  public onNewReport(callback: (report: SafetyReport) => void) {
    this.socket?.on('report:new', callback);
    return () => {
      this.socket?.off('report:new', callback);
    };
  }

  public onCheckinEscalation(callback: (data: any) => void) {
    this.socket?.on('checkin:escalated', callback);
    return () => {
      this.socket?.off('checkin:escalated', callback);
    };
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketClient = new SocketClient();
