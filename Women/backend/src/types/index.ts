export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  avatar?: string;
}

export type UserPublic = Omit<User, 'passwordHash'>;

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
  verified: boolean;
  notifyOnSOS: boolean;
  createdAt: string;
}

export type IncidentStatus = 'NEW' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';

export interface EmergencyIncident {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  address: string;
  status: IncidentStatus;
  startedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  cancelledAt?: string;
  notes?: string;
  isDemo?: boolean;
  contactNotifications?: ContactNotificationLog[];
}

export interface ContactNotificationLog {
  contactId: string;
  contactName: string;
  channel: 'SMS' | 'EMAIL' | 'PUSH';
  destination: string;
  status: 'QUEUED' | 'DELIVERED' | 'FAILED';
  deliveryId: string;
  timestamp: string;
  messagePreview: string;
}

export interface LocationUpdate {
  id: string;
  incidentId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  speed?: number;
  heading?: number;
  batteryLevel?: number;
  timestamp: string;
}

export type SafetyReportCategory =
  | 'POOR_LIGHTING'
  | 'HARASSMENT'
  | 'ISOLATED_AREA'
  | 'SUSPICIOUS_ACTIVITY'
  | 'UNSAFE_TRANSIT'
  | 'ROAD_OBSTRUCTION'
  | 'OTHER';

export type ReportStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface SafetyReport {
  id: string;
  userId: string;
  userName: string;
  category: SafetyReportCategory;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  status: ReportStatus;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  moderatedAt?: string;
  moderatedBy?: string;
}

export type CheckinStatus = 'ACTIVE' | 'COMPLETED' | 'ESCALATED' | 'CANCELLED';

export interface SafetyCheckin {
  id: string;
  userId: string;
  userName: string;
  durationMinutes: number;
  startedAt: string;
  expiresAt: string;
  destination: string;
  initialLat?: number;
  initialLng?: number;
  status: CheckinStatus;
  completedAt?: string;
  escalatedAt?: string;
  contactIds: string[];
}

export type SafetyZoneType = 'POLICE_STATION' | 'HOSPITAL' | 'SAFE_SHELTER' | 'VERIFIED_SAFE_HAVEN' | 'HIGH_RISK_ZONE';

export interface SafetyZone {
  id: string;
  name: string;
  type: SafetyZoneType;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  safetyScore: number; // 0 to 100
  address: string;
  phone?: string;
  hours?: string;
  description?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole | 'SYSTEM';
  action: string;
  incidentId?: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export interface RouteOption {
  id: string;
  name: string;
  summary: string;
  distanceKm: number;
  durationMins: number;
  aiSafetyScore: number;
  safetyRating: 'VERY_SAFE' | 'SAFE' | 'MODERATE' | 'CAUTION';
  safetyReasons: string[];
  riskFactors: string[];
  wellLitPercentage: number;
  safePlacesCount: number;
  coordinates: [number, number][]; // [lat, lng] pairs
  isRecommended: boolean;
}
