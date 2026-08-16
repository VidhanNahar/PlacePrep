import { prisma } from '../db/client.js';
import { CreateCompanyInput, CompanyDTO } from '@placeprep/shared';
import slugify from 'slugify';

export class CompanyRepository {
  async findAll(options: { query?: string; industry?: string; page: number; limit: number }) {
    const { query, industry, page, limit } = options;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }
    if (industry) {
      where.industry = { equals: industry, mode: 'insensitive' };
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { totalExperiencesCount: 'desc' },
      }),
      prisma.company.count({ where }),
    ]);

    return {
      companies: companies.map(this.mapToDTO),
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    const company = await prisma.company.findUnique({
      where: { id },
    });
    return company ? this.mapToDTO(company) : null;
  }

  async findBySlug(slug: string) {
    const company = await prisma.company.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { experiences: { where: { status: 'APPROVED' } } },
        },
      },
    });
    return company ? this.mapToDTO(company) : null;
  }

  async create(data: CreateCompanyInput) {
    const slug = slugify(data.name, { lower: true, strict: true });
    const company = await prisma.company.create({
      data: {
        name: data.name,
        slug,
        websiteUrl: data.websiteUrl || null,
        logoUrl: data.logoUrl || null,
        industry: data.industry || null,
        description: data.description || null,
      },
    });
    return this.mapToDTO(company);
  }

  async incrementExperienceCount(companyId: string, count = 1) {
    await prisma.company.update({
      where: { id: companyId },
      data: { totalExperiencesCount: { increment: count } },
    });
  }

  private mapToDTO(company: any): CompanyDTO {
    return {
      id: company.id,
      name: company.name,
      slug: company.slug,
      websiteUrl: company.websiteUrl,
      logoUrl: company.logoUrl,
      industry: company.industry,
      description: company.description,
      totalExperiencesCount: company.totalExperiencesCount ?? 0,
      createdAt: company.createdAt.toISOString(),
    };
  }
}

export const companyRepository = new CompanyRepository();
