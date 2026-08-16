import { companyRepository } from '../repositories/company.repository.js';
import { CreateCompanyInput } from '@placeprep/shared';
import { cacheService } from './cache.service.js';
import { NotFoundError } from '../errors/AppError.js';

export class CompanyService {
  async listCompanies(options: { query?: string; industry?: string; page: number; limit: number }) {
    const cacheKey = `companies:${options.query || ''}:${options.industry || ''}:${options.page}:${options.limit}`;
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) return cached;

    const result = await companyRepository.findAll(options);
    await cacheService.set(cacheKey, result, 1000 * 60 * 5); // 5 min cache
    return result;
  }

  async getCompanyBySlug(slug: string) {
    const company = await companyRepository.findBySlug(slug);
    if (!company) throw new NotFoundError('Company not found');
    return company;
  }

  async createCompany(data: CreateCompanyInput) {
    const company = await companyRepository.create(data);
    await cacheService.delPattern('companies:*');
    return company;
  }
}

export const companyService = new CompanyService();
