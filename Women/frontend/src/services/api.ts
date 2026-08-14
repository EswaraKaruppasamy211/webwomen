import {
  User,
  EmergencyContact,
  EmergencyIncident,
  LocationUpdate,
  SafetyReport,
  SafetyCheckin,
  SafetyZone,
  AuditLog,
  RouteOption,
} from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('safeher_token');
    }
  }

  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('safeher_token', token);
      } else {
        localStorage.removeItem('safeher_token');
      }
    }
  }

  public getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('safeher_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Request failed with status ${res.status}`);
      }
      return data;
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to SafeHer AI backend. Please check server status.');
      }
      throw err;
    }
  }

  // --- Auth ---
  public async login(email: string, password: string): Promise<{ success: boolean; token: string; user: User }> {
    const res = await this.request<{ success: boolean; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  public async register(payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<{ success: boolean; token: string; user: User }> {
    const res = await this.request<{ success: boolean; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  public async getProfile(): Promise<{ success: boolean; user: User }> {
    return this.request<{ success: boolean; user: User }>('/auth/me');
  }

  // --- Emergencies ---
  public async createIncident(payload: {
    latitude: number;
    longitude: number;
    accuracy: number;
    address?: string;
    isDemo?: boolean;
  }): Promise<{ success: boolean; incident: EmergencyIncident; isExisting?: boolean }> {
    return this.request('/emergencies', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getActiveIncident(): Promise<{
    success: boolean;
    active: boolean;
    incident: EmergencyIncident | null;
    locationUpdates?: LocationUpdate[];
  }> {
    return this.request('/emergencies/active');
  }

  public async getIncident(id: string): Promise<{
    success: boolean;
    incident: EmergencyIncident;
    locationUpdates: LocationUpdate[];
  }> {
    return this.request(`/emergencies/${id}`);
  }

  public async addLocationUpdate(
    incidentId: string,
    payload: {
      latitude: number;
      longitude: number;
      accuracy: number;
      speed?: number;
      heading?: number;
      batteryLevel?: number;
    }
  ): Promise<{ success: boolean; location: LocationUpdate }> {
    return this.request(`/emergencies/${incidentId}/location`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async updateIncidentStatus(
    id: string,
    status: string,
    notes?: string
  ): Promise<{ success: boolean; incident: EmergencyIncident }> {
    return this.request(`/emergencies/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  public async getAllIncidents(status?: string): Promise<{ success: boolean; incidents: EmergencyIncident[] }> {
    const query = status ? `?status=${status}` : '';
    return this.request(`/emergencies/all${query}`);
  }

  // --- Contacts ---
  public async getContacts(): Promise<{ success: boolean; contacts: EmergencyContact[] }> {
    return this.request('/contacts');
  }

  public async addContact(payload: {
    name: string;
    phone: string;
    email?: string;
    relationship: string;
    notifyOnSOS?: boolean;
  }): Promise<{ success: boolean; contact: EmergencyContact }> {
    return this.request('/contacts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async updateContact(
    id: string,
    payload: Partial<EmergencyContact>
  ): Promise<{ success: boolean; contact: EmergencyContact }> {
    return this.request(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public async deleteContact(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  public async testContactAlert(id: string): Promise<{ success: boolean; message: string; deliveryStatus: string }> {
    return this.request(`/contacts/${id}/test-alert`, {
      method: 'POST',
    });
  }

  // --- Navigation & AI Route Scorer ---
  public async calculateRoutes(payload: {
    startLat: number;
    startLng: number;
    destLat: number;
    destLng: number;
    destinationName?: string;
    travelMode?: 'WALKING' | 'TRANSIT' | 'DRIVING';
  }): Promise<{
    success: boolean;
    routes: RouteOption[];
    safePlacesNearRoute: SafetyZone[];
    disclaimer: string;
  }> {
    return this.request('/navigation/route', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getSafePlaces(): Promise<{ success: boolean; safePlaces: SafetyZone[] }> {
    return this.request('/navigation/safe-places');
  }

  public async getHazards(): Promise<{
    success: boolean;
    hazards: SafetyReport[];
    cautionZones: SafetyZone[];
  }> {
    return this.request('/navigation/hazards');
  }

  // --- SafeAI Chat ---
  public async chatAI(payload: {
    message: string;
    isEmergencyMode?: boolean;
    currentLat?: number;
    currentLng?: number;
  }): Promise<{
    success: boolean;
    reply: string;
    mode: string;
    suggestedActions?: { label: string; action: string; color: string }[];
  }> {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Reports ---
  public async getReports(status?: string): Promise<{ success: boolean; reports: SafetyReport[] }> {
    const query = status ? `?status=${status}` : '';
    return this.request(`/reports${query}`);
  }

  public async getPublicReports(): Promise<{ success: boolean; reports: SafetyReport[] }> {
    return this.request('/reports/public');
  }

  public async createReport(payload: {
    category: string;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    address?: string;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }): Promise<{ success: boolean; report: SafetyReport; message: string }> {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async moderateReport(
    id: string,
    status: 'APPROVED' | 'REJECTED'
  ): Promise<{ success: boolean; report: SafetyReport }> {
    return this.request(`/reports/${id}/moderate`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  public async deleteReport(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/reports/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Safety Checkin ---
  public async getActiveCheckin(): Promise<{
    success: boolean;
    hasActiveCheckin: boolean;
    checkin: SafetyCheckin | null;
  }> {
    return this.request('/checkins/active');
  }

  public async startCheckin(payload: {
    durationMinutes: number;
    destination: string;
    initialLat?: number;
    initialLng?: number;
    contactIds?: string[];
  }): Promise<{ success: boolean; checkin: SafetyCheckin; message: string }> {
    return this.request('/checkins/start', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async confirmSafeCheckin(id: string): Promise<{ success: boolean; checkin: SafetyCheckin; message: string }> {
    return this.request(`/checkins/${id}/confirm-safe`, {
      method: 'POST',
    });
  }

  public async cancelCheckin(id: string): Promise<{ success: boolean; checkin: SafetyCheckin; message: string }> {
    return this.request(`/checkins/${id}/cancel`, {
      method: 'POST',
    });
  }

  // --- Admin ---
  public async getAdminOverview(): Promise<{
    success: boolean;
    stats: {
      activeEmergencies: number;
      newReportsCount: number;
      totalUsersCount: number;
      resolvedEmergenciesCount: number;
      safetyZonesCount: number;
      avgResponseTimeSec: number;
    };
    activeEmergencies: EmergencyIncident[];
    recentReports: SafetyReport[];
    recentAuditLogs: AuditLog[];
  }> {
    return this.request('/admin/overview');
  }

  public async getAdminAnalytics(): Promise<{
    success: boolean;
    analytics: {
      statusCounts: Record<string, number>;
      categoryCounts: Record<string, number>;
      trendData: { day: string; incidents: number; reports: number }[];
      totalIncidents: number;
      totalReports: number;
    };
  }> {
    return this.request('/admin/analytics');
  }

  public async getAuditLogs(limit = 100): Promise<{ success: boolean; logs: AuditLog[] }> {
    return this.request(`/admin/audit-logs?limit=${limit}`);
  }

  public async createSafetyZone(payload: any): Promise<{ success: boolean; zone: SafetyZone }> {
    return this.request('/admin/zones', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Demo Mode ---
  public async simulateSOS(): Promise<{ success: boolean; incident: EmergencyIncident }> {
    return this.request('/demo/simulate-sos', { method: 'POST' });
  }

  public async simulateMovement(incidentId: string): Promise<{ success: boolean; location: LocationUpdate }> {
    return this.request('/demo/simulate-movement', {
      method: 'POST',
      body: JSON.stringify({ incidentId }),
    });
  }

  public async resetDemo(): Promise<{ success: boolean; message: string }> {
    return this.request('/demo/reset', { method: 'POST' });
  }
}

export const api = new ApiClient();
