import { roundTypeRepository } from '../repositories/roundType.repository.js';
import { CreateRoundTypeInput } from '@placeprep/shared';

export class RoundTypeService {
  async listRoundTypes() {
    return roundTypeRepository.getAll();
  }

  async createRoundType(input: CreateRoundTypeInput) {
    return roundTypeRepository.create(input.name, input.description);
  }
}

export const roundTypeService = new RoundTypeService();
