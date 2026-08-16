import { experienceRepository } from '../repositories/experience.repository.js';
import { CreateExperienceInput, ExperienceQueryParams } from '@placeprep/shared';
import { NotFoundError } from '../errors/AppError.js';
import { cacheService } from './cache.service.js';

export class ExperienceService {
  async listExperiences(params: ExperienceQueryParams, currentUserId?: string) {
    return experienceRepository.findAll(params, currentUserId);
  }

  async getExperienceById(id: string, currentUserId?: string) {
    const experience = await experienceRepository.findById(id, currentUserId);
    if (!experience) throw new NotFoundError('Interview experience not found');

    // Fire and forget view increment
    experienceRepository.incrementViews(id).catch(() => {});
    return experience;
  }

  async submitExperience(userId: string, data: CreateExperienceInput) {
    const experience = await experienceRepository.create(userId, data);
    await cacheService.delPattern('analytics:*');
    return experience;
  }

  async toggleUpvote(userId: string, experienceId: string) {
    return experienceRepository.toggleUpvote(userId, experienceId);
  }

  async toggleBookmark(userId: string, experienceId: string) {
    return experienceRepository.toggleBookmark(userId, experienceId);
  }
}

export const experienceService = new ExperienceService();
