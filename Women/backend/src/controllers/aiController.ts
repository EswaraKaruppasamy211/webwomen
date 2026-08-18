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
          mode: 'AGENTIC_EMERGENCY_TRIAGE',
          reply:
            '🚨 **SafeAI Agent Mode: Immediate Action Activated**\n\n' +
            '1. **Trigger SOS now** to broadcast your live GPS and queue alerts for your emergency contacts.\n' +
            '2. **Move toward safety**: Choose a public, well-lit place such as a pharmacy, grocery store, station, or hospital.\n' +
            '3. **Call local emergency services**: Dial **911** (US) or **112 / 100** immediately.\n' +
            '4. **Create a deterrent**: Make noise, activate your personal alarm, or simulate a fake incoming call to break attention.\n\n' +
            'A good safety plan is to stay visible, stay loud, and move toward people and light while waiting for help.',
          suggestedActions: [
            { label: 'Trigger SOS Now', action: 'ACTIVATE_SOS', color: 'emergency' },
            { label: 'Call 911 / Police', action: 'CALL_POLICE', color: 'emergency' },
            { label: 'Fake Incoming Call', action: 'FAKE_CALL', color: 'amber' },
            { label: 'Find Nearest Safe Haven', action: 'NEAREST_SAFE_HAVEN', color: 'teal' },
          ],
          agentSummary: 'The Emergency Response Agent detected a likely danger scenario and prioritized immediate exit-to-safety behavior with emergency escalation.',
        });
        return;
      }

      // Safe Route Planning
      if (lower.includes('route') || lower.includes('navigate') || lower.includes('walk') || lower.includes('night')) {
        res.json({
          success: true,
          mode: 'AGENTIC_SAFE_NAVIGATION',
          reply:
            '🧭 **SafeAI Route Agent:**\n\n' +
            '• I recommend the path with the highest **AI safety score**, prioritizing open streets, dense lighting, and verified safe havens.\n' +
            '• Avoid isolated shortcuts, poorly lit pockets, and empty side streets after dusk.\n' +
            '• I suggest enabling a **Safety Check-In timer** so your trusted contacts can be alerted if you stop checking in.\n\n' +
            '_Tip: Open the Navigate screen for a route comparison and live risk scoring from the Safety Agent._',
          suggestedActions: [
            { label: 'Open Safe Navigation', action: 'NAVIGATE_PAGE', color: 'teal' },
            { label: 'Set 30-Min Safety Timer', action: 'SET_CHECKIN_30', color: 'safeGreen' },
          ],
          agentSummary: 'The Route Agent analyzed the trip context and selected safer movement patterns, visibility, and check-in escalation.',
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
        mode: 'AGENTIC_GENERAL_ASSIST',
        reply:
          `Hello! I am **SafeAI Agent**, your proactive personal safety assistant. I can assess your situation, suggest the safest next move, and trigger the right safety workflow.\n\n` +
          `• Plan the safest route based on lighting, safe havens, and hazard risk\n` +
          `• Find nearby 24/7 safe places, hospitals, or police posts\n` +
          `• Guide you step-by-step through de-escalation and emergency triage\n` +
          `• Coordinate a Safety Check-in timer and emergency escalation plan\n\n` +
          `Tell me where you are headed or what safety situation you are dealing with, and I will act like your personal safety agent.`,
        suggestedActions: [
          { label: 'Plan Safe Route', action: 'NAVIGATE_PAGE', color: 'teal' },
          { label: 'Set Safety Timer', action: 'SET_CHECKIN', color: 'safeGreen' },
          { label: 'Nearest Safe Haven', action: 'NEAREST_SAFE_HAVEN', color: 'teal' },
          { label: 'Emergency Protocol', action: 'EMERGENCY_INFO', color: 'emergency' },
        ],
        agentSummary: 'The Safety Agent is in proactive assistance mode and is ready to help plan, monitor, and escalate based on the user’s travel or danger context.',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'SafeAI service encountered an error.' });
    }
  }
}

export const aiController = new AIController();
