import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { verifyToken, sanitizeUser } from '../utils/security';
import { db } from '../db/database';
import { UserPublic } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: UserPublic;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Missing or invalid Authorization header.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = db.getUserById(decoded.id);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User session invalid. Account may have been deactivated.',
      });
      return;
    }

    req.user = sanitizeUser(user);
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired session token.',
    });
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Access forbidden. Administrator privileges required.',
      });
      return;
    }
    next();
  });
}

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 login attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
});

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  console.error(`[Error] ${req.method} ${req.path}:`, err.message);

  // Return clean, user-friendly JSON without exposing internal stack traces
  res.status(500).json({
    success: false,
    message: 'An unexpected system error occurred. Please try again or contact emergency support.',
  });
}
