import { describe, it, expect, vi } from 'vitest';
import { validate } from '../../middleware/validate.middleware.js';
import { ValidationError } from '../../errors/AppError.js';
import { z } from 'zod';

describe('Validate Middleware Test Suite', () => {
  const testSchema = {
    body: z.object({
      name: z.string().min(3),
      age: z.number().int().positive(),
    }),
    query: z.object({
      page: z.coerce.number().default(1),
    }),
  };

  it('should pass valid body and query data and coerce query params', async () => {
    const middleware = validate(testSchema);
    const req: any = {
      body: { name: 'John Doe', age: 22 },
      query: { page: '3' },
    };
    const res: any = {};
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ name: 'John Doe', age: 22 });
    expect(req.query.page).toBe(3);
  });

  it('should catch validation failure and pass ValidationError to next()', async () => {
    const middleware = validate(testSchema);
    const req: any = {
      body: { name: 'Jo', age: -5 },
      query: {},
    };
    const res: any = {};
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(ValidationError);
    expect(err.statusCode).toBe(422);
    expect(Array.isArray(err.details)).toBe(true);
    expect(err.details.length).toBeGreaterThanOrEqual(2);
  });
});
