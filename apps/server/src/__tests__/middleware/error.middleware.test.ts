import { describe, it, expect, vi } from 'vitest';
import { errorHandler } from '../../middleware/error.middleware.js';
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
} from '../../errors/AppError.js';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

describe('Error Middleware Test Suite', () => {
  const mockReq: any = { path: '/api/v1/test', method: 'GET' };
  const mockNext = vi.fn();

  const createMockRes = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should handle AppError subclasses with proper status codes and error code names', () => {
    const errors = [
      { err: new BadRequestError('Invalid query format'), expectedStatus: 400, expectedCode: 'BadRequestError' },
      { err: new UnauthorizedError('Token expired'), expectedStatus: 401, expectedCode: 'UnauthorizedError' },
      { err: new ForbiddenError('Permission denied'), expectedStatus: 403, expectedCode: 'ForbiddenError' },
      { err: new NotFoundError('Experience not found'), expectedStatus: 404, expectedCode: 'NotFoundError' },
      { err: new ConflictError('Company already exists'), expectedStatus: 409, expectedCode: 'ConflictError' },
      { err: new ValidationError('Validation failed', [{ field: 'email', message: 'Required' }]), expectedStatus: 422, expectedCode: 'ValidationError' },
    ];

    for (const { err, expectedStatus, expectedCode } of errors) {
      const res = createMockRes();
      errorHandler(err, mockReq, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(expectedStatus);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: expectedCode,
            message: err.message,
          }),
        })
      );
    }
  });

  it('should handle Prisma P2002 Unique Constraint error as 409 Conflict', () => {
    const res = createMockRes();
    const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: '6.4.1',
      meta: { target: ['slug'] },
    });

    errorHandler(prismaError, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'ConflictError',
        }),
      })
    );
  });

  it('should handle Prisma P2025 Record Not Found error as 404 NotFound', () => {
    const res = createMockRes();
    const prismaError = new Prisma.PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: '6.4.1',
    });

    errorHandler(prismaError, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'NotFoundError',
        }),
      })
    );
  });

  it('should handle direct ZodError with 422', () => {
    const res = createMockRes();
    const schema = z.object({ count: z.number() });
    try {
      schema.parse({ count: 'invalid' });
    } catch (zodErr) {
      errorHandler(zodErr as Error, mockReq, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'ValidationError',
          }),
        })
      );
    }
  });

  it('should handle unhandled unexpected errors with 500 status code', () => {
    const res = createMockRes();
    const unknownError = new Error('Database connection failed');

    errorHandler(unknownError, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'INTERNAL_SERVER_ERROR',
        }),
      })
    );
  });
});
