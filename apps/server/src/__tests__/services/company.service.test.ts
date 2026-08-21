import { describe, it, expect, vi, beforeEach } from 'vitest';
import { companyService } from '../../services/company.service.js';
import { prisma } from '../../db/client.js';
import { NotFoundError, ConflictError } from '../../errors/AppError.js';

vi.mock('../../db/client.js', () => ({
  prisma: {
    company: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('Company Service & Repository Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list companies with pagination and return mapped DTOs', async () => {
    const mockCompanies = [
      {
        id: 'c1',
        name: 'Google',
        slug: 'google',
        websiteUrl: 'https://careers.google.com',
        logoUrl: null,
        industry: 'Tech',
        description: 'Search & Cloud',
        totalExperiencesCount: 5,
        createdAt: new Date(),
      },
    ];

    (prisma.company.findMany as any).mockResolvedValueOnce(mockCompanies);
    (prisma.company.count as any).mockResolvedValueOnce(1);

    const result = await companyService.listCompanies({ page: 1, limit: 10 });

    expect(result.companies).toHaveLength(1);
    expect(result.companies[0].name).toBe('Google');
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it('should return company by slug', async () => {
    const mockCompany = {
      id: 'c1',
      name: 'Google',
      slug: 'google',
      totalExperiencesCount: 5,
      createdAt: new Date(),
    };

    (prisma.company.findUnique as any).mockResolvedValueOnce(mockCompany);

    const result = await companyService.getCompanyBySlug('google');
    expect(result.slug).toBe('google');
  });

  it('should throw NotFoundError if company slug does not exist', async () => {
    (prisma.company.findUnique as any).mockResolvedValueOnce(null);

    await expect(companyService.getCompanyBySlug('nonexistent')).rejects.toThrow(NotFoundError);
  });

  it('should create new company with generated slug', async () => {
    (prisma.company.findFirst as any).mockResolvedValueOnce(null);
    (prisma.company.create as any).mockResolvedValueOnce({
      id: 'c2',
      name: 'Microsoft',
      slug: 'microsoft',
      websiteUrl: null,
      logoUrl: null,
      industry: 'Cloud',
      description: null,
      totalExperiencesCount: 0,
      createdAt: new Date(),
    });

    const result = await companyService.createCompany({
      name: 'Microsoft',
      industry: 'Cloud',
    });

    expect(result.name).toBe('Microsoft');
    expect(result.slug).toBe('microsoft');
  });

  it('should throw ConflictError if company already exists', async () => {
    (prisma.company.findFirst as any).mockResolvedValueOnce({ id: 'c1', name: 'Google', slug: 'google' });

    await expect(
      companyService.createCompany({ name: 'Google' })
    ).rejects.toThrow(ConflictError);
  });
});
