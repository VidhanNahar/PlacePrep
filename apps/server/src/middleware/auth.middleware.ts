import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../errors/AppError.js';
import { prisma } from '../db/client.js';
import { UserRole } from '@placeprep/shared';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        authId: string;
        email: string;
        fullName: string;
        collegeName: string;
        role: UserRole;
        isBanned: boolean;
      };
    }
  }
}

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY);

export const authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];

    // Development fallback if testing with mock token
    if (env.NODE_ENV === 'development' && token.startsWith('mock-dev-token:')) {
      const email = token.split(':')[1] || 'student@thapar.edu';
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            authId: '00000000-0000-0000-0000-000000000001',
            email,
            fullName: 'Dev Test User',
            collegeName: 'Thapar Institute of Engineering & Technology',
            graduationYear: 2026,
            branch: 'Computer Science',
            role: 'ADMIN',
            isVerified: true,
          },
        });
      }

      req.user = {
        id: user.id,
        authId: user.authId,
        email: user.email,
        fullName: user.fullName,
        collegeName: user.collegeName,
        role: user.role as UserRole,
        isBanned: user.isBanned,
      };
      return next();
    }

    // Verify token with Supabase
    const { data: { user: authUser }, error } = await supabase.auth.getUser(token);

    if (error || !authUser) {
      throw new UnauthorizedError('Invalid or expired authentication token');
    }

    // Look up local user record
    let user = await prisma.user.findUnique({
      where: { authId: authUser.id },
    });

    if (!user) {
      // JIT user provisioning if first login
      user = await prisma.user.create({
        data: {
          authId: authUser.id,
          email: authUser.email || '',
          fullName: authUser.user_metadata?.full_name || 'PlacePrep User',
          collegeName: authUser.user_metadata?.college_name || 'Campus Student',
          graduationYear: Number(authUser.user_metadata?.graduation_year) || 2026,
          branch: authUser.user_metadata?.branch || 'Engineering',
          role: 'STUDENT',
          isVerified: Boolean(authUser.email_confirmed_at),
        },
      });
    }

    if (user.isBanned) {
      throw new UnauthorizedError('Your account has been suspended.');
    }

    req.user = {
      id: user.id,
      authId: user.authId,
      email: user.email,
      fullName: user.fullName,
      collegeName: user.collegeName,
      role: user.role as UserRole,
      isBanned: user.isBanned,
    };

    next();
  } catch (err) {
    next(err);
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.headers.authorization) {
    return next();
  }
  return authenticate(req, res, next);
};
