import { describe, it, expect, vi } from 'vitest';
import { requireRole } from '../../middleware/role.middleware.js';
import { UnauthorizedError, ForbiddenError } from '../../errors/AppError.js';
import { UserRole } from '@placeprep/shared';

describe('Role Middleware Test Suite', () => {
  it('should reject unauthenticated request with UnauthorizedError', () => {
    const middleware = requireRole([UserRole.MODERATOR, UserRole.ADMIN]);
    const req: any = {};
    const res: any = {};
    const next = vi.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
  });

  it('should reject STUDENT role when MODERATOR or ADMIN is required', () => {
    const middleware = requireRole([UserRole.MODERATOR, UserRole.ADMIN]);
    const req: any = {
      user: {
        id: 'u1',
        role: UserRole.STUDENT,
      },
    };
    const res: any = {};
    const next = vi.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(ForbiddenError);
    expect(err.statusCode).toBe(403);
  });

  it('should allow MODERATOR when MODERATOR or ADMIN is required', () => {
    const middleware = requireRole([UserRole.MODERATOR, UserRole.ADMIN]);
    const req: any = {
      user: {
        id: 'u2',
        role: UserRole.MODERATOR,
      },
    };
    const res: any = {};
    const next = vi.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('should allow ADMIN for super-admin only endpoints', () => {
    const middleware = requireRole([UserRole.ADMIN]);
    const req: any = {
      user: {
        id: 'u3',
        role: UserRole.ADMIN,
      },
    };
    const res: any = {};
    const next = vi.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });
});
