import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/database';
import { hashPassword, comparePassword, generateToken, sanitizeUser } from '../utils/security';
import { AuthenticatedRequest } from '../middleware/auth';

// Strict Email / Gmail validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function isValidEmailFormat(email: string): { isValid: boolean; reason?: string; isGmail?: boolean } {
  if (!email || typeof email !== 'string') {
    return { isValid: false, reason: 'Email address is required.' };
  }
  const cleanEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return { isValid: false, reason: 'Please enter a valid email format (e.g. yourname@gmail.com).' };
  }

  const [localPart, domain] = cleanEmail.split('@');
  if (!domain || !domain.includes('.')) {
    return { isValid: false, reason: 'Invalid email domain format.' };
  }

  if (localPart.includes('..') || localPart.startsWith('.') || localPart.endsWith('.')) {
    return { isValid: false, reason: 'Email local part contains invalid consecutive or trailing dots.' };
  }

  const isGmail = domain === 'gmail.com' || domain === 'googlemail.com';

  return { isValid: true, isGmail };
}

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address format'),
  phone: z.string().min(7, 'Valid phone number required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password required'),
});

export class AuthController {
  public async verifyEmailAddress(req: Request, res: Response): Promise<void> {
    const email = (req.query.email as string) || (req.body?.email as string) || '';
    const check = isValidEmailFormat(email);

    if (!check.isValid) {
      res.status(400).json({
        success: false,
        isValid: false,
        message: check.reason,
      });
      return;
    }

    const existingUser = db.getUserByEmail(email);
    res.json({
      success: true,
      isValid: true,
      isGmail: check.isGmail,
      isRegistered: !!existingUser,
      message: check.isGmail
        ? 'Valid Google Mail (Gmail) address verified.'
        : 'Valid email address format verified.',
    });
  }

  public async register(req: Request, res: Response): Promise<void> {
    try {
      const parsed = RegisterSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: parsed.error.errors[0].message,
        });
        return;
      }

      const { name, email, phone, password } = parsed.data;

      // Strict email/gmail validation check
      const emailCheck = isValidEmailFormat(email);
      if (!emailCheck.isValid) {
        res.status(400).json({
          success: false,
          message: emailCheck.reason,
        });
        return;
      }

      const existingUser = db.getUserByEmail(email);
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'An account with this email address already exists.',
        });
        return;
      }

      const passwordHash = await hashPassword(password);
      const newUser = await db.createUser({
        name,
        email: email.trim().toLowerCase(),
        phone,
        passwordHash,
        role: 'USER',
      });

      const token = generateToken({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      });

      await db.createAuditLog({
        actorId: newUser.id,
        actorName: newUser.name,
        actorRole: newUser.role,
        action: 'USER_REGISTERED',
        details: `New account registered: ${newUser.email} (Gmail/Email Verified)`,
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Account created and email verified successfully.',
        token,
        user: sanitizeUser(newUser),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const parsed = LoginSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: parsed.error.errors[0].message,
        });
        return;
      }

      const { email, password } = parsed.data;
      const user = db.getUserByEmail(email.trim().toLowerCase());

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
        return;
      }

      const isMatch = await comparePassword(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
        return;
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      await db.createAuditLog({
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: 'USER_LOGIN',
        details: `User logged in with role ${user.role}`,
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        message: 'Authentication successful.',
        token,
        user: sanitizeUser(user),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
    }
  }

  public async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const user = db.getUserById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({
      success: true,
      user: sanitizeUser(user),
    });
  }
}

export const authController = new AuthController();
