// src/modules/auth/auth.service.ts
import jwt from 'jsonwebtoken';
import { prisma } from '../../core/config/database.js';
import { env } from '../../core/config/env.js';
import { SecurityUtils } from '../../core/utils/security.js';

import { 
  LoginDTO, 
  RefreshTokenDTO, 
  ChangePasswordDTO 
} from './auth.schemas.js';

export class AuthService {
  async login(credentials: LoginDTO) {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
      include: { 
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            department: {
              select: { name: true }
            }
          }
        }
      },
    });

    if (!user) {
      throw new Error('CREDENTIALS_INVALID');
    }

    const isValidPassword = await SecurityUtils.comparePassword(
      credentials.password, 
      user.passwordHash
    );

    if (!isValidPassword) {
      throw new Error('CREDENTIALS_INVALID');
    }

    const accessTokenOptions: jwt.SignOptions = {
      expiresIn: env.JWT_EXPIRES_IN
    };

    const refreshTokenOptions: jwt.SignOptions = {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN
    };

    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        employeeId: user.employeeId 
      },
      env.JWT_SECRET,
      accessTokenOptions
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      env.JWT_REFRESH_SECRET,
      refreshTokenOptions
    );

    const userResponse = {
      id: user.id,
      email: user.email,
      role: user.role,
      employee: user.employee ? {
        id: user.employee.id,
        firstName: user.employee.firstName,
        lastName: user.employee.lastName,
        position: user.employee.position,
        department: user.employee.department.name
      } : null
    };

    return {
      accessToken,
      refreshToken,
      user: userResponse,
      expiresIn: env.JWT_EXPIRES_IN
    };
  }

  async refreshToken(data: RefreshTokenDTO) {
    try {
      const payload = jwt.verify(data.refreshToken, env.JWT_REFRESH_SECRET) as any;

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { 
          id: true, 
          email: true, 
          role: true, 
          employeeId: true 
        },
      });

      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      const accessTokenOptions: jwt.SignOptions = {
        expiresIn: env.JWT_EXPIRES_IN
      };

      const accessToken = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role,
          employeeId: user.employeeId 
        },
        env.JWT_SECRET,
        accessTokenOptions
      );

      return { 
        accessToken,
        expiresIn: env.JWT_EXPIRES_IN
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('REFRESH_TOKEN_EXPIRED');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('REFRESH_TOKEN_INVALID');
      }
      throw error;
    }
  }

  async changePassword(userId: string, data: ChangePasswordDTO) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true }
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    const isCurrentPasswordValid = await SecurityUtils.comparePassword(
      data.currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      throw new Error('CURRENT_PASSWORD_INVALID');
    }

    const newPasswordHash = await SecurityUtils.hashPassword(data.newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    });

    return { success: true };
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        employee: {
          include: {
            department: {
              select: { name: true }
            }
          }
        }
      }
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    const { passwordHash, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  async logout(userId: string) {
    await prisma.auditLog.create({
      data: {
        entity: 'User',
        action: 'LOGOUT',
        userId: userId,
        after: { timestamp: new Date().toISOString() }
      }
    });

    return { success: true, message: 'Sesión cerrada correctamente' };
  }
}