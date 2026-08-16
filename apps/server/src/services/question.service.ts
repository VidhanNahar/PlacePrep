import { questionRepository } from '../repositories/question.repository.js';
import { QuestionQueryParams } from '@placeprep/shared';
import { cacheService } from './cache.service.js';

export class QuestionService {
  async listQuestions(params: QuestionQueryParams) {
    return questionRepository.findAll(params);
  }

  async getCategories() {
    const cacheKey = 'question:categories';
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) return cached;

    const categories = await questionRepository.getCategories();
    await cacheService.set(cacheKey, categories, 1000 * 60 * 30); // 30 min cache
    return categories;
  }
}

export const questionService = new QuestionService();
