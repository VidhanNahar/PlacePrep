import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware.js';
import { UnauthorizedError } from '../../errors/AppError.js';
import { prisma } from '../../db/client.js';

// Mock prisma
vi.mock('../../db/client.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('Auth Middleware Test Suite', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    vi.clearAllMocks();
    req = {
      headers: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  describe('authenticate', () => {
    it('should throw UnauthorizedError if Authorization header is missing', async () => {
      await authenticate(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(UnauthorizedError);
      expect(err.message).toMatch(/Missing or invalid Authorization header/i);
    });

    it('should throw UnauthorizedError if Authorization header does not start with Bearer', async () => {
      req.headers.authorization = 'Basic dXNlcjpwYXNz';
      await authenticate(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(UnauthorizedError);
    });

    it('should authenticate mock dev token and provision student user', async () => {
      req.headers.authorization = 'Bearer mock-dev-token:student@thapar.edu';

      const mockDbUser = {
        id: 'u1111111-1111-1111-1111-111111111111',
        authId: 'a1111111-1111-1111-1111-111111111111',
        email: 'student@thapar.edu',
        fullName: 'Student User',
        collegeName: 'Thapar Institute',
        role: 'STUDENT',
        isBanned: false,
      };

      (prisma.user.findUnique as any).mockResolvedValueOnce(mockDbUser);

      await authenticate(req, res, next);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'student@thapar.edu' },
      });
      expect(req.user).toBeDefined();
      expect(req.user.email).toBe('student@thapar.edu');
      expect(req.user.role).toBe('STUDENT');
      expect(next).toHaveBeenCalledWith();
    });

    it('should authenticate mock admin token and attach ADMIN role', async () => {
      req.headers.authorization = 'Bearer mock-dev-token:admin@placeprep.com';

      const mockAdminUser = {
        id: 'u2222222-2222-2222-2222-222222222222',
        authId: 'a2222222-2222-2222-2222-222222222222',
        email: 'admin@placeprep.com',
        fullName: 'Admin User',
        collegeName: 'PlacePrep HQ',
        role: 'ADMIN',
        isBanned: false,
      };

      (prisma.user.findUnique as any).mockResolvedValueOnce(mockAdminUser);

      await authenticate(req, res, next);

      expect(req.user.role).toBe('ADMIN');
      expect(next).toHaveBeenCalledWith();
    });

    it('should auto-create user on first mock login if not present in DB', async () => {
      req.headers.authorization = 'Bearer mock-dev-token:newuser@thapar.edu';

      (prisma.user.findUnique as any).mockResolvedValueOnce(null);
      (prisma.user.create as any).mockResolvedValueOnce({
        id: 'new-user-id',
        authId: 'new-auth-id',
        email: 'newuser@thapar.edu',
        fullName: 'Dev Test User',
        collegeName: 'Thapar Institute of Engineering & Technology',
        role: 'STUDENT',
        isBanned: false,
      });

      await authenticate(req, res, next);

      expect(prisma.user.create).toHaveBeenCalled();
      expect(req.user.email).toBe('newuser@thapar.edu');
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('optionalAuth', () => {
    it('should proceed without error if no authorization header is provided', async () => {
      await optionalAuth(req, res, next);
      expect(next).toHaveBeenCalledWith();
      expect(req.user).toBeUndefined();
    });

    it('should authenticate if authorization header is present', async () => {
      req.headers.authorization = 'Bearer mock-dev-token:student@thapar.edu';
      (prisma.user.findUnique as any).mockResolvedValueOnce({
        id: 'u1111111-1111-1111-1111-111111111111',
        authId: 'a1111111-1111-1111-1111-111111111111',
        email: 'student@thapar.edu',
        fullName: 'Student User',
        collegeName: 'Thapar Institute',
        role: 'STUDENT',
        isBanned: false,
      });

      await optionalAuth(req, res, next);
      expect(req.user).toBeDefined();
      expect(next).toHaveBeenCalledWith();
    });
  });
});
