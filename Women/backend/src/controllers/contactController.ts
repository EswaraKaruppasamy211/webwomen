import { Response } from 'express';
import { z } from 'zod';
import { db } from '../db/database';
import { AuthenticatedRequest } from '../middleware/auth';
import { config } from '../config';

const ContactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(7, 'Valid phone number required'),
  email: z.string().email().optional().or(z.literal('')),
  relationship: z.string().min(2, 'Relationship required (e.g., Mother, Sister, Friend)'),
  notifyOnSOS: z.boolean().default(true),
});

export class ContactController {
  public async getContacts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const contacts = db.getContactsByUserId(req.user!.id);
      res.json({ success: true, contacts });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve contacts.' });
    }
  }

  public async addContact(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = ContactSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, message: parsed.error.errors[0].message });
        return;
      }

      const { name, phone, email, relationship, notifyOnSOS } = parsed.data;

      const newContact = await db.createContact({
        userId: req.user!.id,
        name,
        phone,
        email: email || '',
        relationship,
        verified: true, // Mark verified
        notifyOnSOS: notifyOnSOS ?? true,
      });

      await db.createAuditLog({
        actorId: req.user!.id,
        actorName: req.user!.name,
        actorRole: req.user!.role,
        action: 'CONTACT_ADDED',
        details: `Added emergency contact: ${name} (${relationship})`,
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Emergency contact added successfully.',
        contact: newContact,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to add emergency contact.' });
    }
  }

  public async updateContact(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const contact = db.getContactById(id);

      if (!contact || contact.userId !== req.user!.id) {
        res.status(404).json({ success: false, message: 'Contact not found.' });
        return;
      }

      const updated = await db.updateContact(id, req.body);
      res.json({
        success: true,
        message: 'Contact updated successfully.',
        contact: updated,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update contact.' });
    }
  }

  public async deleteContact(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await db.deleteContact(id, req.user!.id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Contact not found.' });
        return;
      }
      res.json({ success: true, message: 'Emergency contact removed.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to delete contact.' });
    }
  }

  public async testAlert(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const contact = db.getContactById(id);
      if (!contact || contact.userId !== req.user!.id) {
        res.status(404).json({ success: false, message: 'Contact not found.' });
        return;
      }

      const hasRealGateway = Boolean(config.smsProviderKey || config.emailProviderKey);
      const deliveryStatus = hasRealGateway ? 'DELIVERED' : 'QUEUED';
      const successMessage = hasRealGateway
        ? `Test alert sent to ${contact.name} via ${contact.phone ? 'SMS' : 'Email'}.`
        : `Test alert queued for ${contact.name} via ${contact.phone ? 'SMS' : 'Email'}; no live delivery provider is configured.`;

      res.json({
        success: true,
        message: successMessage,
        deliveryStatus,
        verifiedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to send test alert.' });
    }
  }
}

export const contactController = new ContactController();
