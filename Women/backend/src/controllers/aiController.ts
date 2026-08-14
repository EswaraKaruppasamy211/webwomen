import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/database';

const ChatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  isEmergencyMode: z.boolean().optional().default(false),
  currentLat: z.number().optional(),
  currentLng: z.number().optional(),
});

export class AIController {
  public async chat(req: Request, res: Response): Promise<void> {
    try {
      const parsed = ChatSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, message: parsed.error.errors[0].message });
        return;
      }

      const { message, isEmergencyMode, currentLat, currentLng } = parsed.data;
      const lower = message.toLowerCase();

      // If in active emergency mode or user triggers SOS distress phrases, prioritize direct action!
      if (
        isEmergencyMode ||
        lower.includes('help') ||
        lower.includes('danger') ||
        lower.includes('followed') ||
        lower.includes('attack') ||
        lower.includes('scared') ||
        lower.includes('emergency')
      ) {
        res.json({
          success: true,
          mode: 'EMERGENCY_TRIAGE',
          reply:
            '🚨 **IMMEDIATE ACTION REQUIRED:**\n\n' +
            '1. **Press the RED SOS BUTTON** now to broadcast your live GPS to administrators and emergency contacts.\n' +
            '2. **Head towards public, illuminated areas**: Enter an open convenience store, pharmacy, or restaurant immediately.\n' +
            '3. **Call Local Police**: Dial **911** (US) or **112 / 100** immediately.\n' +
            '4. **Make noise**: Call out firmly, sound your personal alarm, or activate the simulated incoming call in SafeAI.',
          suggestedActions: [
            { label: "Trigger SOS Now", action: 'ACTIVATE_SOS', color: 'emergency' },
            { label: 'Call 911 / Police', action: 'CALL_POLICE', color: 'emergency' },
            { label: 'Fake Incoming Call', action: 'FAKE_CALL', color: 'amber' },
            { label: 'Find Nearest Safe Haven', action: 'NEAREST_SAFE_HAVEN', color: 'teal' },
          ],
        });
        return;
      }

      // Safe Route Planning
      if (lower.includes('route') || lower.includes('navigate') || lower.includes('walk') || lower.includes('night')) {
        res.json({
          success: true,
          mode: 'SAFE_NAVIGATION_ASSIST',
          reply:
            '🧭 **Safe Route Guidance:**\n\n' +
            '• Our AI route scorer prioritizes verified **Safe Havens**, 24/7 commercial storefronts, and continuous street lighting.\n' +
            '• Avoid shortcuts through alleyways or unmonitored parking lots after dusk.\n' +
            '• Share your live trip with a contact using our **Safety Check-In** timer.\n\n' +
            '_Tip: Switch to the Navigate tab to calculate the safest path with real-time AI Safety Scores._',
          suggestedActions: [
            { label: 'Open Safe Navigation', action: 'NAVIGATE_PAGE', color: 'teal' },
            { label: 'Set 30-Min Safety Timer', action: 'SET_CHECKIN_30', color: 'safeGreen' },
          ],
        });
        return;
      }

      // Nearby safe places
      if (lower.includes('safe place') || lower.includes('police') || lower.includes('hospital') || lower.includes('shelter')) {
        const safeZones = db.getSafetyZones().filter((z) => z.type !== 'HIGH_RISK_ZONE');
        const listText = safeZones
          .slice(0, 3)
          .map((z) => `• **${z.name}** (${z.type.replace('_', ' ')}): ${z.address} - Phone: ${z.phone || '24/7 Access'}`)
          .join('\n');

        res.json({
          success: true,
          mode: 'SAFE_PLACES',
          reply:
            '🛡️ **Nearest Verified Safe Places:**\n\n' +
            listText +
            '\n\nThese locations feature 24/7 security, open lobbies, or police dispatch.',
          suggestedActions: [
            { label: 'View on Interactive Map', action: 'VIEW_MAP', color: 'teal' },
            { label: 'Report a Hazard Zone', action: 'REPORT_HAZARD', color: 'amber' },
          ],
        });
        return;
      }

      // Legal rights and helplines
      if (lower.includes('rights') || lower.includes('helpline') || lower.includes('number') || lower.includes('law')) {
        res.json({
          success: true,
          mode: 'LEGAL_RESOURCES',
          reply:
            '⚖️ **Women Safety Resources & Helplines:**\n\n' +
            '• **Emergency Services**: 911 / 112\n' +
            '• **National Domestic Violence Hotline**: 1-800-799-SAFE (7233)\n' +
            '• **RAINN National Sexual Assault Hotline**: 1-800-656-4673\n' +
            '• **Crisis Text Line**: Text HOME to 741741\n\n' +
            'You have the legal right to seek refuge in any open public business during immediate distress.',
          suggestedActions: [
            { label: 'Call 911', action: 'CALL_POLICE', color: 'emergency' },
            { label: 'Emergency Contacts', action: 'VIEW_CONTACTS', color: 'teal' },
          ],
        });
        return;
      }

      // Default conversational response
      res.json({
        success: true,
        mode: 'GENERAL_ASSIST',
        reply:
          `Hello! I am **SafeAI**, your dedicated personal safety assistant. I can assist you with:\n\n` +
          `• Planning the safest walking routes with AI risk assessment\n` +
          `• Finding 24/7 open Safe Havens, hospitals, and police posts\n` +
          `• Step-by-step de-escalation tactics and emergency triage\n` +
          `• Scheduling a Safety Check-in timer before your trip\n\n` +
          `How can I help keep you safe today?`,
        suggestedActions: [
          { label: 'Plan Safe Route', action: 'NAVIGATE_PAGE', color: 'teal' },
          { label: 'Set Safety Timer', action: 'SET_CHECKIN', color: 'safeGreen' },
          { label: 'Nearest Safe Haven', action: 'NEAREST_SAFE_HAVEN', color: 'teal' },
          { label: 'Emergency Protocol', action: 'EMERGENCY_INFO', color: 'emergency' },
        ],
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'SafeAI service encountered an error.' });
    }
  }
}

export const aiController = new AIController();
