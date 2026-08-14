import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  User,
  EmergencyContact,
  EmergencyIncident,
  LocationUpdate,
  SafetyReport,
  SafetyCheckin,
  SafetyZone,
  AuditLog,
} from '../types';
import { hashPassword } from '../utils/security';
import { config } from '../config';

interface DatabaseSchema {
  users: User[];
  emergencyContacts: EmergencyContact[];
  emergencyIncidents: EmergencyIncident[];
  locationUpdates: LocationUpdate[];
  safetyReports: SafetyReport[];
  safetyCheckins: SafetyCheckin[];
  safetyZones: SafetyZone[];
  auditLogs: AuditLog[];
}

const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'safeher_db.json');

class DatabaseStore {
  private data: DatabaseSchema = {
    users: [],
    emergencyContacts: [],
    emergencyIncidents: [],
    locationUpdates: [],
    safetyReports: [],
    safetyCheckins: [],
    safetyZones: [],
    auditLogs: [],
  };

  private isSaving = false;
  private savePending = false;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        console.log('📦 Loaded database from disk successfully.');
      } else {
        console.log('🌱 Initializing new database with seed data...');
        await this.seedInitialData();
      }
    } catch (err) {
      console.error('⚠️ Database init warning, seeding in-memory store:', err);
      await this.seedInitialData();
    }
  }

  private async persist(): Promise<void> {
    if (this.isSaving) {
      this.savePending = true;
      return;
    }

    this.isSaving = true;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database to disk:', err);
    } finally {
      this.isSaving = false;
      if (this.savePending) {
        this.savePending = false;
        this.persist();
      }
    }
  }

  public async seedInitialData(): Promise<void> {
    const adminPasswordHash = await hashPassword(config.adminDefaultPassword);
    const userPasswordHash = await hashPassword('User@SafeHer2026!');

    const adminId = 'usr_admin_001';
    const demoUserId = 'usr_demo_001';

    const defaultAdmin: User = {
      id: adminId,
      name: 'System Administrator',
      email: config.adminDefaultEmail,
      phone: '+1-800-555-0199',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    };

    const demoUser: User = {
      id: demoUserId,
      name: 'Sarah Jenkins',
      email: 'sarah@safeher.ai',
      phone: '+1-555-014-8832',
      passwordHash: userPasswordHash,
      role: 'USER',
      createdAt: new Date().toISOString(),
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    };

    const demoContacts: EmergencyContact[] = [
      {
        id: 'cnt_001',
        userId: demoUserId,
        name: 'Elena Jenkins',
        phone: '+1-555-019-4481',
        email: 'elena.jenkins@example.com',
        relationship: 'Mother',
        verified: true,
        notifyOnSOS: true,
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      },
      {
        id: 'cnt_002',
        userId: demoUserId,
        name: 'Marcus Vance',
        phone: '+1-555-018-9922',
        email: 'm.vance@example.com',
        relationship: 'Brother',
        verified: true,
        notifyOnSOS: true,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: 'cnt_003',
        userId: demoUserId,
        name: 'Aisha Patel',
        phone: '+1-555-017-3311',
        email: 'aisha.p@example.com',
        relationship: 'Close Friend / Roommate',
        verified: true,
        notifyOnSOS: true,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ];

    // Seed realistic Safe Havens (Police stations, Hospitals, 24/7 Transit hubs)
    const demoZones: SafetyZone[] = [
      {
        id: 'zone_001',
        name: 'Metropolitan Central Police Station',
        type: 'POLICE_STATION',
        latitude: 37.7749,
        longitude: -122.4194,
        radiusMeters: 300,
        safetyScore: 98,
        address: '850 Bryant St, Civic Center',
        phone: '911 / (415) 553-0123',
        hours: '24/7 Emergency Dispatch',
        description: '24/7 guarded command post with safe waiting lobby and CCTV coverage.',
      },
      {
        id: 'zone_002',
        name: 'St. Jude General Hospital & Trauma Center',
        type: 'HOSPITAL',
        latitude: 37.7833,
        longitude: -122.4167,
        radiusMeters: 250,
        safetyScore: 96,
        address: '1001 Potrero Ave, Mission District',
        phone: '(415) 206-8000',
        hours: '24/7 Emergency Room',
        description: 'Well-lit emergency admission entrance with continuous security patrol.',
      },
      {
        id: 'zone_003',
        name: 'SafeHaven Women Crisis Support & Transit Hub',
        type: 'SAFE_SHELTER',
        latitude: 37.7699,
        longitude: -122.4469,
        radiusMeters: 200,
        safetyScore: 95,
        address: '350 Parnassus Ave',
        phone: '1-800-799-7233',
        hours: '24/7 Assistance',
        description: 'Certified safe sanctuary providing immediate refuge, security, and shelter.',
      },
      {
        id: 'zone_004',
        name: 'Union Square 24/7 Security Booth',
        type: 'VERIFIED_SAFE_HAVEN',
        latitude: 37.7879,
        longitude: -122.4075,
        radiusMeters: 180,
        safetyScore: 92,
        address: '333 Post St, Downtown',
        phone: '(415) 781-7880',
        hours: '24 Hours',
        description: 'High visibility tourist security kiosk with rapid police link.',
      },
      {
        id: 'zone_005',
        name: 'South Pier Industrial Alley (Caution Area)',
        type: 'HIGH_RISK_ZONE',
        latitude: 37.7712,
        longitude: -122.3921,
        radiusMeters: 400,
        safetyScore: 35,
        address: 'Warehouse Sector 4',
        hours: 'High Risk 20:00 - 06:00',
        description: 'Reported poor lighting, limited pedestrian traffic, and restricted visibility after dusk.',
      },
    ];

    // Seed demo safety reports
    const demoReports: SafetyReport[] = [
      {
        id: 'rep_001',
        userId: demoUserId,
        userName: 'Sarah Jenkins',
        category: 'POOR_LIGHTING',
        title: 'Broken street lamps along 4th Street walkway',
        description: 'Multiple streetlights are completely dead between Elm and Pine St. Walking here after 8 PM is in pitch darkness.',
        latitude: 37.7791,
        longitude: -122.4112,
        address: '4th St & Elm Avenue',
        status: 'APPROVED',
        severity: 'MEDIUM',
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        moderatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        moderatedBy: adminId,
      },
      {
        id: 'rep_002',
        userId: demoUserId,
        userName: 'Aisha Patel',
        category: 'HARASSMENT',
        title: 'Catcalling and aggressive loitering near subway exit',
        description: 'Group of individuals blocking subway stairs and following commuters down the sidewalk.',
        latitude: 37.7815,
        longitude: -122.4205,
        address: 'Civic Plaza Station Exit B',
        status: 'APPROVED',
        severity: 'HIGH',
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        moderatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        moderatedBy: adminId,
      },
      {
        id: 'rep_003',
        userId: demoUserId,
        userName: 'Maya Lin',
        category: 'ISOLATED_AREA',
        title: 'Closed construction barricade forces blind detour',
        description: 'Construction fencing blocks the pedestrian sidewalk, creating an isolated bottleneck with zero escape route.',
        latitude: 37.7725,
        longitude: -122.4258,
        address: 'Market St & 9th Bypass',
        status: 'PENDING',
        severity: 'MEDIUM',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
    ];

    const demoAuditLogs: AuditLog[] = [
      {
        id: 'aud_001',
        actorId: adminId,
        actorName: 'System Administrator',
        actorRole: 'ADMIN',
        action: 'SYSTEM_BOOT',
        details: 'SafeHer AI security subsystem initialized with active Socket.IO dispatch.',
        ipAddress: '127.0.0.1',
        timestamp: new Date().toISOString(),
      },
    ];

    this.data = {
      users: [defaultAdmin, demoUser],
      emergencyContacts: demoContacts,
      emergencyIncidents: [],
      locationUpdates: [],
      safetyReports: demoReports,
      safetyCheckins: [],
      safetyZones: demoZones,
      auditLogs: demoAuditLogs,
    };

    await this.persist();
  }

  // --- Users ---
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const newUser: User = {
      ...user,
      id: `usr_${uuidv4().substring(0, 8)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    await this.persist();
    return newUser;
  }

  public async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    await this.persist();
    return this.data.users[idx];
  }

  // --- Emergency Contacts ---
  public getContactsByUserId(userId: string): EmergencyContact[] {
    return this.data.emergencyContacts.filter((c) => c.userId === userId);
  }

  public getContactById(id: string): EmergencyContact | undefined {
    return this.data.emergencyContacts.find((c) => c.id === id);
  }

  public async createContact(contact: Omit<EmergencyContact, 'id' | 'createdAt'>): Promise<EmergencyContact> {
    const newContact: EmergencyContact = {
      ...contact,
      id: `cnt_${uuidv4().substring(0, 8)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.emergencyContacts.push(newContact);
    await this.persist();
    return newContact;
  }

  public async updateContact(id: string, updates: Partial<EmergencyContact>): Promise<EmergencyContact | undefined> {
    const idx = this.data.emergencyContacts.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.data.emergencyContacts[idx] = { ...this.data.emergencyContacts[idx], ...updates };
    await this.persist();
    return this.data.emergencyContacts[idx];
  }

  public async deleteContact(id: string, userId: string): Promise<boolean> {
    const initialLen = this.data.emergencyContacts.length;
    this.data.emergencyContacts = this.data.emergencyContacts.filter((c) => !(c.id === id && c.userId === userId));
    if (this.data.emergencyContacts.length !== initialLen) {
      await this.persist();
      return true;
    }
    return false;
  }

  // --- Emergency Incidents ---
  public getIncidents(): EmergencyIncident[] {
    return [...this.data.emergencyIncidents].sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  public getActiveIncidents(): EmergencyIncident[] {
    return this.data.emergencyIncidents
      .filter((inc) => ['NEW', 'ACKNOWLEDGED', 'IN_PROGRESS'].includes(inc.status))
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  public getIncidentById(id: string): EmergencyIncident | undefined {
    return this.data.emergencyIncidents.find((inc) => inc.id === id);
  }

  public getActiveIncidentByUserId(userId: string): EmergencyIncident | undefined {
    return this.data.emergencyIncidents.find(
      (inc) => inc.userId === userId && ['NEW', 'ACKNOWLEDGED', 'IN_PROGRESS'].includes(inc.status)
    );
  }

  public async createIncident(incident: Omit<EmergencyIncident, 'id' | 'startedAt'>): Promise<EmergencyIncident> {
    const newIncident: EmergencyIncident = {
      ...incident,
      id: `inc_${uuidv4().substring(0, 8)}`,
      startedAt: new Date().toISOString(),
    };
    this.data.emergencyIncidents.push(newIncident);
    await this.persist();
    return newIncident;
  }

  public async updateIncident(id: string, updates: Partial<EmergencyIncident>): Promise<EmergencyIncident | undefined> {
    const idx = this.data.emergencyIncidents.findIndex((inc) => inc.id === id);
    if (idx === -1) return undefined;
    this.data.emergencyIncidents[idx] = { ...this.data.emergencyIncidents[idx], ...updates };
    await this.persist();
    return this.data.emergencyIncidents[idx];
  }

  // --- Location Updates ---
  public getLocationUpdates(incidentId: string): LocationUpdate[] {
    return this.data.locationUpdates
      .filter((loc) => loc.incidentId === incidentId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  public async addLocationUpdate(update: Omit<LocationUpdate, 'id'>): Promise<LocationUpdate> {
    const newUpdate: LocationUpdate = {
      ...update,
      id: `loc_${uuidv4().substring(0, 8)}`,
    };
    this.data.locationUpdates.push(newUpdate);
    await this.persist();
    return newUpdate;
  }

  // --- Safety Reports ---
  public getReports(statusFilter?: string): SafetyReport[] {
    let reports = [...this.data.safetyReports];
    if (statusFilter && statusFilter !== 'ALL') {
      reports = reports.filter((r) => r.status === statusFilter);
    }
    return reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getApprovedReports(): SafetyReport[] {
    return this.data.safetyReports.filter((r) => r.status === 'APPROVED');
  }

  public getReportById(id: string): SafetyReport | undefined {
    return this.data.safetyReports.find((r) => r.id === id);
  }

  public async createReport(report: Omit<SafetyReport, 'id' | 'createdAt'>): Promise<SafetyReport> {
    const newReport: SafetyReport = {
      ...report,
      id: `rep_${uuidv4().substring(0, 8)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.safetyReports.push(newReport);
    await this.persist();
    return newReport;
  }

  public async updateReport(id: string, updates: Partial<SafetyReport>): Promise<SafetyReport | undefined> {
    const idx = this.data.safetyReports.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    this.data.safetyReports[idx] = { ...this.data.safetyReports[idx], ...updates };
    await this.persist();
    return this.data.safetyReports[idx];
  }

  public async deleteReport(id: string): Promise<boolean> {
    const initialLen = this.data.safetyReports.length;
    this.data.safetyReports = this.data.safetyReports.filter((r) => r.id !== id);
    if (this.data.safetyReports.length !== initialLen) {
      await this.persist();
      return true;
    }
    return false;
  }

  // --- Safety Checkins ---
  public getCheckins(userId?: string): SafetyCheckin[] {
    if (userId) {
      return this.data.safetyCheckins.filter((c) => c.userId === userId);
    }
    return this.data.safetyCheckins;
  }

  public getActiveCheckins(): SafetyCheckin[] {
    return this.data.safetyCheckins.filter((c) => c.status === 'ACTIVE');
  }

  public getActiveCheckinByUserId(userId: string): SafetyCheckin | undefined {
    return this.data.safetyCheckins.find((c) => c.userId === userId && c.status === 'ACTIVE');
  }

  public async createCheckin(checkin: Omit<SafetyCheckin, 'id' | 'startedAt'>): Promise<SafetyCheckin> {
    const newCheckin: SafetyCheckin = {
      ...checkin,
      id: `chk_${uuidv4().substring(0, 8)}`,
      startedAt: new Date().toISOString(),
    };
    this.data.safetyCheckins.push(newCheckin);
    await this.persist();
    return newCheckin;
  }

  public async updateCheckin(id: string, updates: Partial<SafetyCheckin>): Promise<SafetyCheckin | undefined> {
    const idx = this.data.safetyCheckins.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.data.safetyCheckins[idx] = { ...this.data.safetyCheckins[idx], ...updates };
    await this.persist();
    return this.data.safetyCheckins[idx];
  }

  // --- Safety Zones ---
  public getSafetyZones(): SafetyZone[] {
    return this.data.safetyZones;
  }

  public async createSafetyZone(zone: Omit<SafetyZone, 'id'>): Promise<SafetyZone> {
    const newZone: SafetyZone = {
      ...zone,
      id: `zne_${uuidv4().substring(0, 8)}`,
    };
    this.data.safetyZones.push(newZone);
    await this.persist();
    return newZone;
  }

  // --- Audit Logs ---
  public getAuditLogs(limit = 100): AuditLog[] {
    return [...this.data.auditLogs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  public async createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    const newLog: AuditLog = {
      ...log,
      id: `aud_${uuidv4().substring(0, 8)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.push(newLog);
    // Keep max 500 logs
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(-500);
    }
    await this.persist();
    return newLog;
  }
}

export const db = new DatabaseStore();
