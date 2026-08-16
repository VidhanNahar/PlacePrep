import { prisma } from '../db/client.js';
import { SyncProfileInput, UpdateProfileInput, UserDTO, UserRole } from '@placeprep/shared';

export class UserRepository {
  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            experiences: true,
            upvotes: true,
            bookmarks: true,
          },
        },
      },
    });
    return user ? this.mapToDTO(user) : null;
  }

  async findByAuthId(authId: string) {
    const user = await prisma.user.findUnique({
      where: { authId },
    });
    return user ? this.mapToDTO(user) : null;
  }

  async syncProfile(authId: string, email: string, data: SyncProfileInput) {
    const domain = email.includes('@') ? email.split('@')[1] : null;

    const user = await prisma.user.upsert({
      where: { authId },
      update: {
        fullName: data.fullName,
        collegeName: data.collegeName,
        collegeDomain: domain,
        graduationYear: data.graduationYear,
        branch: data.branch,
      },
      create: {
        authId,
        email,
        fullName: data.fullName,
        collegeName: data.collegeName,
        collegeDomain: domain,
        graduationYear: data.graduationYear,
        branch: data.branch,
        role: 'STUDENT',
        isVerified: true,
      },
    });

    return this.mapToDTO(user);
  }

  async updateProfile(id: string, data: UpdateProfileInput) {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.fullName && { fullName: data.fullName }),
        ...(data.graduationYear && { graduationYear: data.graduationYear }),
        ...(data.branch && { branch: data.branch }),
        ...(data.bio !== undefined && { bio: data.bio }),
      },
    });

    return this.mapToDTO(user);
  }

  async updateRole(id: string, role: UserRole) {
    const user = await prisma.user.update({
      where: { id },
      data: { role },
    });
    return this.mapToDTO(user);
  }

  private mapToDTO(user: any): UserDTO {
    return {
      id: user.id,
      authId: user.authId,
      email: user.email,
      fullName: user.fullName,
      collegeName: user.collegeName,
      graduationYear: user.graduationYear,
      branch: user.branch,
      role: user.role as UserRole,
      isVerified: user.isVerified,
      createdAt: user.createdAt.toISOString(),
    };
  }
}

export const userRepository = new UserRepository();
