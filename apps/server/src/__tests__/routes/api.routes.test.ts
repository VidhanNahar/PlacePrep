import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';
import { prisma } from '../../db/client.js';
import { cacheService } from '../../services/cache.service.js';

vi.mock('../../db/client.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    company: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    interviewExperience: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      aggregate: vi.fn(),
      groupBy: vi.fn(),
    },
    interviewQuestion: {
      findMany: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    questionCategory: {
      findMany: vi.fn(),
    },
    comment: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    upvote: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    bookmark: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    report: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

describe('API End-to-End Route Integration Tests', () => {
  const app = createApp();

  beforeEach(async () => {
    vi.clearAllMocks();
    await cacheService.flush();
  });

  describe('Health Endpoint', () => {
    it('GET /health should return 200 and healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.version).toBe('1.0.0');
    });
  });

  describe('404 Handler', () => {
    it('GET /api/v1/invalid-route should return 404 with NotFoundError', async () => {
      const res = await request(app).get('/api/v1/invalid-route');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NotFoundError');
    });
  });

  describe('Auth Routes', () => {
    it('GET /api/v1/auth/me should return current user profile', async () => {
      (prisma.user.findUnique as any)
        .mockResolvedValueOnce({
          id: 'u1',
          authId: 'a1',
          email: 'student@thapar.edu',
          fullName: 'Aarav Sharma',
          collegeName: 'Thapar',
          graduationYear: 2025,
          branch: 'CSE',
          role: 'STUDENT',
          isVerified: true,
          isBanned: false,
        })
        .mockResolvedValueOnce({
          id: 'u1',
          authId: 'a1',
          email: 'student@thapar.edu',
          fullName: 'Aarav Sharma',
          collegeName: 'Thapar',
          graduationYear: 2025,
          branch: 'CSE',
          role: 'STUDENT',
          isVerified: true,
          createdAt: new Date(),
        });

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer mock-dev-token:student@thapar.edu');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('student@thapar.edu');
    });

    it('POST /api/v1/auth/sync-profile should validate payload and sync profile', async () => {
      (prisma.user.findUnique as any).mockResolvedValueOnce({
        id: 'u1',
        authId: 'a1',
        email: 'student@thapar.edu',
        fullName: 'Aarav Sharma',
        collegeName: 'Thapar',
        role: 'STUDENT',
        isBanned: false,
      });

      (prisma.user.upsert as any).mockResolvedValueOnce({
        id: 'u1',
        authId: 'a1',
        email: 'student@thapar.edu',
        fullName: 'Aarav Sharma',
        collegeName: 'Thapar Institute',
        graduationYear: 2025,
        branch: 'CSE',
        role: 'STUDENT',
        isVerified: true,
        createdAt: new Date(),
      });

      const res = await request(app)
        .post('/api/v1/auth/sync-profile')
        .set('Authorization', 'Bearer mock-dev-token:student@thapar.edu')
        .send({
          fullName: 'Aarav Sharma',
          collegeName: 'Thapar Institute',
          graduationYear: 2025,
          branch: 'CSE',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fullName).toBe('Aarav Sharma');
    });
  });

  describe('Company Routes', () => {
    it('GET /api/v1/companies should return list of companies', async () => {
      (prisma.company.findMany as any).mockResolvedValueOnce([
        {
          id: 'c1',
          name: 'Google',
          slug: 'google',
          websiteUrl: 'https://google.com',
          logoUrl: null,
          industry: 'Tech',
          description: 'Tech leader',
          totalExperiencesCount: 10,
          createdAt: new Date(),
        },
      ]);
      (prisma.company.count as any).mockResolvedValueOnce(1);

      const res = await request(app).get('/api/v1/companies');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Google');
    });

    it('GET /api/v1/companies/:slug should return single company detail', async () => {
      (prisma.company.findUnique as any).mockResolvedValueOnce({
        id: 'c1',
        name: 'Google',
        slug: 'google',
        websiteUrl: 'https://google.com',
        logoUrl: null,
        industry: 'Tech',
        description: 'Tech leader',
        totalExperiencesCount: 10,
        createdAt: new Date(),
      });

      const res = await request(app).get('/api/v1/companies/google');

      expect(res.status).toBe(200);
      expect(res.body.data.slug).toBe('google');
    });
  });

  describe('Experience Routes', () => {
    it('GET /api/v1/experiences should list approved experiences', async () => {
      (prisma.interviewExperience.findMany as any).mockResolvedValueOnce([]);
      (prisma.interviewExperience.count as any).mockResolvedValueOnce(0);

      const res = await request(app).get('/api/v1/experiences');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it('POST /api/v1/experiences/:id/upvote should toggle upvote', async () => {
      (prisma.user.findUnique as any).mockResolvedValueOnce({
        id: 'u1',
        email: 'student@thapar.edu',
        role: 'STUDENT',
        isBanned: false,
      });

      (prisma.interviewExperience.findUnique as any).mockResolvedValueOnce({ id: 'exp1' });
      (prisma.upvote.findUnique as any).mockResolvedValueOnce(null);
      (prisma.upvote.create as any).mockResolvedValueOnce({});
      (prisma.interviewExperience.update as any).mockResolvedValueOnce({ upvoteCount: 1 });

      const res = await request(app)
        .post('/api/v1/experiences/exp1/upvote')
        .set('Authorization', 'Bearer mock-dev-token:student@thapar.edu');

      expect(res.status).toBe(200);
      expect(res.body.data.upvoted).toBe(true);
      expect(res.body.data.upvoteCount).toBe(1);
    });
  });

  describe('Comment Routes', () => {
    it('GET /api/v1/comments/experience/:id should return comments', async () => {
      (prisma.comment.findMany as any).mockResolvedValueOnce([]);

      const res = await request(app).get('/api/v1/comments/experience/exp1');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it('POST /api/v1/comments/experience/:id should create comment when authenticated', async () => {
      (prisma.user.findUnique as any).mockResolvedValueOnce({
        id: 'u1',
        email: 'student@thapar.edu',
        role: 'STUDENT',
        isBanned: false,
      });

      (prisma.comment.create as any).mockResolvedValueOnce({
        id: 'cm1',
        experienceId: 'exp1',
        userId: 'u1',
        content: 'Thanks for sharing!',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { fullName: 'Student', collegeName: 'Campus' },
      });
      (prisma.interviewExperience.update as any).mockResolvedValueOnce({});

      const res = await request(app)
        .post('/api/v1/comments/experience/exp1')
        .set('Authorization', 'Bearer mock-dev-token:student@thapar.edu')
        .send({ content: 'Thanks for sharing!' });

      expect(res.status).toBe(201);
      expect(res.body.data.content).toBe('Thanks for sharing!');
    });
  });

  describe('Analytics Routes', () => {
    it('GET /api/v1/analytics/overview should return analytics overview data', async () => {
      (prisma.interviewExperience.count as any)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(7);
      (prisma.company.count as any).mockResolvedValueOnce(5);
      (prisma.interviewQuestion.count as any).mockResolvedValueOnce(30);
      (prisma.interviewExperience.aggregate as any).mockResolvedValueOnce({
        _avg: { compensationCtc: 20 },
      });
      (prisma.interviewExperience.groupBy as any).mockResolvedValueOnce([]);
      (prisma.company.findMany as any).mockResolvedValueOnce([]);
      (prisma.interviewQuestion.groupBy as any).mockResolvedValueOnce([]);
      (prisma.questionCategory.findMany as any).mockResolvedValueOnce([]);

      const res = await request(app).get('/api/v1/analytics/overview');

      expect(res.status).toBe(200);
      expect(res.body.data.totalExperiences).toBe(10);
      expect(res.body.data.totalCompanies).toBe(5);
    });
  });
});
