import { Request, Response } from 'express';
import { UserService } from './user.service.js';
import { sendSuccess, sendError } from '../../core/utils/response.js';
import { UserQuerySchema } from './user.schemas.js';

const userService = new UserService();

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'UNKNOWN_SERVER_ERROR';
};

export class UserController {
  async createUser(req: Request, res: Response) {
    try {

      const result = await userService.createUser(req.body);

      sendSuccess(res, result, 201, {
        message: 'Usuario creado exitosamente'
      });
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      
      switch (errorMessage) {
        case 'DUPLICATE_EMAIL':
          sendError(res, 'DUPLICATE_EMAIL', 'El email ya está registrado', 409);
          break;
        case 'EMPLOYEE_NOT_FOUND':
          sendError(res, 'EMPLOYEE_NOT_FOUND', 'Empleado no encontrado', 404);
          break;
        case 'EMPLOYEE_ALREADY_HAS_USER':
          sendError(res, 'EMPLOYEE_ALREADY_HAS_USER', 'El empleado ya tiene un usuario asociado', 409);
          break;
        default:
          sendError(res, 'CREATE_ERROR', 'Error al crear usuario', 500);
      }
    }
  }

  async getUsers(req: Request, res: Response) {
    try {
      const query = UserQuerySchema.parse(req.query); 
      const result = await userService.getUsers(query);
      

      const usersWithoutPasswords = result.data.map((user: any) => {
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      sendSuccess(res, usersWithoutPasswords, 200, { 
        message: 'Usuarios obtenidos',
        meta: result.meta 
      });
    } catch (error: unknown) {
      sendError(res, 'FETCH_ERROR', 'Error al obtener usuarios', 500);
    }
  }

  async getUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await userService.getUserById(id);
      
      const { passwordHash, ...userWithoutPassword } = result as any;

      sendSuccess(res, userWithoutPassword, 200, {
        message: 'Usuario obtenido'
      });
    } catch (error: unknown) {
      if (getErrorMessage(error) === 'USER_NOT_FOUND') {
        sendError(res, 'USER_NOT_FOUND', 'Usuario no encontrado', 404);
      } else {
        sendError(res, 'FETCH_ERROR', 'Error al obtener usuario', 500);
      }
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await userService.updateUser(id, req.body);
      
      const { passwordHash, ...userWithoutPassword } = result as any;

      sendSuccess(res, userWithoutPassword, 200, {
        message: 'Usuario actualizado exitosamente'
      });
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      
      switch (errorMessage) {
        case 'USER_NOT_FOUND':
          sendError(res, 'USER_NOT_FOUND', 'Usuario no encontrado', 404);
          break;
        case 'DUPLICATE_EMAIL':
          sendError(res, 'DUPLICATE_EMAIL', 'El email ya está registrado', 409);
          break;
        case 'EMPLOYEE_NOT_FOUND':
          sendError(res, 'EMPLOYEE_NOT_FOUND', 'Empleado no encontrado', 404);
          break;
        case 'EMPLOYEE_ALREADY_HAS_USER':
          sendError(res, 'EMPLOYEE_ALREADY_HAS_USER', 'El empleado ya tiene un usuario asociado', 409);
          break;
        default:
          sendError(res, 'UPDATE_ERROR', 'Error al actualizar usuario', 500);
      }
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await userService.changeUserPassword(id, req.body);
      
      sendSuccess(res, result, 200, {
        message: 'Contraseña actualizada exitosamente'
      });
    } catch (error: unknown) {
      if (getErrorMessage(error) === 'USER_NOT_FOUND') {
        sendError(res, 'USER_NOT_FOUND', 'Usuario no encontrado', 404);
      } else {
        sendError(res, 'PASSWORD_CHANGE_ERROR', 'Error al cambiar contraseña', 500);
      }
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'UNAUTHORIZED', 'Usuario no autenticado', 401);
      }

      const { id } = req.params;
      const result = await userService.deleteUser(id, req.user.id);
      
      sendSuccess(res, result, 200, {
        message: 'Usuario eliminado exitosamente'
      });
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      
      switch (errorMessage) {
        case 'USER_NOT_FOUND':
          sendError(res, 'USER_NOT_FOUND', 'Usuario no encontrado', 404);
          break;
        case 'CANNOT_DELETE_SELF':
          sendError(res, 'CANNOT_DELETE_SELF', 'No puedes eliminar tu propio usuario', 422);
          break;
        case 'LAST_ADMIN_USER':
          sendError(res, 'LAST_ADMIN_USER', 'No se puede eliminar el último usuario administrador', 422);
          break;
        default:
          sendError(res, 'DELETE_ERROR', 'Error al eliminar usuario', 500);
      }
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const result = await userService.getUserStats();
      
      sendSuccess(res, result, 200, {
        message: 'Estadísticas de usuarios obtenidas'
      });
    } catch (error: unknown) {
      sendError(res, 'STATS_ERROR', 'Error al obtener estadísticas', 500);
    }
  }
}

export const userController = new UserController();