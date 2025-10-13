// src/modules/users/user.service.ts
import { prisma } from '../../core/config/database.js';
import { SecurityUtils } from '../../core/utils/security.js';
import { 
  UserCreateDTO, 
  UserUpdateDTO, 
  UserQueryDTO,
  ChangeUserPasswordDTO
} from './user.schemas.js';

export class UserService {
  async createUser(data: UserCreateDTO) {
    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('DUPLICATE_EMAIL');
    }

    // Si se asigna employeeId, verificar que existe y no tiene usuario
    if (data.employeeId) {
      const employee = await prisma.employee.findUnique({
        where: { id: data.employeeId },
        include: { user: true }
      });

      if (!employee) {
        throw new Error('EMPLOYEE_NOT_FOUND');
      }

      if (employee.user) {
        throw new Error('EMPLOYEE_ALREADY_HAS_USER');
      }
    }

    // Hash de la contraseña
    const passwordHash = await SecurityUtils.hashPassword(data.password);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: data.role,
        employeeId: data.employeeId
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            department: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // Remover passwordHash de la respuesta
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUsers(query: UserQueryDTO) {
    const { q, role, page, pageSize } = query;
    const skip = (page - 1) * pageSize;

    // Construir filtros
    const where: any = {};

    if (q) {
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { employee: { 
            OR: [
              { firstName: { contains: q, mode: 'insensitive' } },
              { lastName: { contains: q, mode: 'insensitive' } }
            ]
          } 
        }
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              position: true,
              department: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.user.count({ where })
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: users,
      meta: {
        pagination: {
          page,
          pageSize,
          total,
          totalPages
        }
      }
    };
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            department: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            action: true,
            entity: true,
            createdAt: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    return user;
  }

  async updateUser(id: string, data: UserUpdateDTO) {
    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      throw new Error('USER_NOT_FOUND');
    }

    // Si se actualiza email, verificar que no existe otro
    if (data.email && data.email !== existingUser.email) {
      const duplicateEmail = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (duplicateEmail) {
        throw new Error('DUPLICATE_EMAIL');
      }
    }

    // Si se asigna employeeId, verificar que existe y no tiene otro usuario
    if (data.employeeId && data.employeeId !== existingUser.employeeId) {
      const employee = await prisma.employee.findUnique({
        where: { id: data.employeeId },
        include: { user: true }
      });

      if (!employee) {
        throw new Error('EMPLOYEE_NOT_FOUND');
      }

      if (employee.user && employee.user.id !== id) {
        throw new Error('EMPLOYEE_ALREADY_HAS_USER');
      }
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        role: data.role,
        employeeId: data.employeeId
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true
          }
        }
      }
    });

    return updatedUser;
  }

  async changeUserPassword(id: string, data: ChangeUserPasswordDTO) {
    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // Hash de la nueva contraseña
    const newPasswordHash = await SecurityUtils.hashPassword(data.newPassword);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id },
      data: { passwordHash: newPasswordHash }
    });

    return { success: true, message: 'Contraseña actualizada correctamente' };
  }

  async deleteUser(id: string, currentUserId: string) {
    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // No permitir auto-eliminación
    if (id === currentUserId) {
      throw new Error('CANNOT_DELETE_SELF');
    }

    // No permitir eliminar el último admin
    if (user.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' }
      });

      if (adminCount <= 1) {
        throw new Error('LAST_ADMIN_USER');
      }
    }

    // Eliminar usuario
    await prisma.user.delete({
      where: { id }
    });

    return { success: true, message: 'Usuario eliminado correctamente' };
  }

  async getUserStats() {
    const totalUsers = await prisma.user.count();
    const byRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true }
    });

    const usersWithEmployee = await prisma.user.count({
      where: { employeeId: { not: null } }
    });

    return {
      total: totalUsers,
      byRole: byRole.map(role => ({
        role: role.role,
        count: role._count.id
      })),
      withEmployee: usersWithEmployee,
      withoutEmployee: totalUsers - usersWithEmployee
    };
  }
}