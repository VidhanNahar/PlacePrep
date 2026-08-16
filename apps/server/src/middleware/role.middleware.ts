import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@placeprep/shared';
import { ForbiddenError, UnauthorizedError } from '../errors/AppError.js';

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Insufficient permissions. Required one of: ${allowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
};
