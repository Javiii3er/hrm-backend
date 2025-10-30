// src/modules/profile/profile.service.ts
import { prisma } from '../../core/config/database.js';
import { SecurityUtils } from '../../core/utils/security.js';
import { UpdateProfileDTO } from './profile.schemas.js';

export class ProfileService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        employee: {
          select: {
            id: true,
            nationalId: true,
            firstName: true,
            lastName: true,
            phone: true,
            position: true,
            status: true,
            hireDate: true,
            department: { select: { name: true } },
          },
        },
      },
    });

    if (!user) throw new Error('USER_NOT_FOUND');

    return user;
  }

  async updateProfile(userId: string, role: string, data: UpdateProfileDTO) {
    if (role !== 'ADMIN') {
      throw new Error('FORBIDDEN');
    }

    const updateData: any = {};
    if (data.email) updateData.email = data.email;
    if (data.newPassword)
      updateData.passwordHash = await SecurityUtils.hashPassword(data.newPassword);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        updatedAt: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            position: true,
            department: { select: { name: true } },
          },
        },
      },
    });

    return updatedUser;
  }
}

export const profileService = new ProfileService();
