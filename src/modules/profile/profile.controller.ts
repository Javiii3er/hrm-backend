// src/modules/profile/profile.controller.ts
import { Request, Response } from 'express';
import { profileService } from './profile.service.js';
import { sendSuccess, sendError } from '../../core/utils/response.js';

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'UNKNOWN_SERVER_ERROR';
};

export class ProfileController {
  async getProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'UNAUTHORIZED', 'Usuario no autenticado', 401);
      }

      const result = await profileService.getProfile(req.user.id);
      sendSuccess(res, result, 200, { message: 'Perfil obtenido correctamente' });
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      switch (msg) {
        case 'USER_NOT_FOUND':
          sendError(res, 'USER_NOT_FOUND', 'Usuario no encontrado', 404);
          break;
        default:
          sendError(res, 'FETCH_ERROR', 'Error al obtener perfil', 500);
      }
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'UNAUTHORIZED', 'No autenticado', 401);
      }

      const result = await profileService.updateProfile(req.user.id, req.user.role, req.body);
      sendSuccess(res, result, 200, { message: 'Perfil actualizado correctamente' });
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      switch (msg) {
        case 'FORBIDDEN':
          sendError(res, 'FORBIDDEN', 'Solo los administradores pueden modificar perfiles', 403);
          break;
        case 'USER_NOT_FOUND':
          sendError(res, 'USER_NOT_FOUND', 'Usuario no encontrado', 404);
          break;
        default:
          sendError(res, 'UPDATE_ERROR', 'Error al actualizar perfil', 500);
      }
    }
  }
}

export const profileController = new ProfileController();

