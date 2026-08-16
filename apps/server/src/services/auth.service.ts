import { userRepository } from '../repositories/user.repository.js';
import { SyncProfileInput, UpdateProfileInput } from '@placeprep/shared';
import { NotFoundError } from '../errors/AppError.js';

export class AuthService {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User profile not found');
    return user;
  }

  async syncProfile(authId: string, email: string, data: SyncProfileInput) {
    return userRepository.syncProfile(authId, email, data);
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    return userRepository.updateProfile(userId, data);
  }
}

export const authService = new AuthService();
