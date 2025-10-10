// src/modules/auth/auth.controller.ts

import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { sendSuccess, sendError } from '../../core/utils/response.js';

const authService = new AuthService();

interface LoginRequest {
  email: string;
  password: string;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

declare module 'express-serve-static-core' {
    interface Request {
        user?: { id: string; [key: string]: any };
    }
}

export class AuthController {
  
  async login(req: Request<{}, {}, LoginRequest>, res: Response) {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, result, 200); 
    } catch (error: unknown) { 
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      switch (errorMessage) {
        case 'CREDENTIALS_INVALID':
          sendError(res, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos', 401);
          break;
        default:
          sendError(res, 'LOGIN_ERROR', 'Error durante el inicio de sesión', 500);
      }
    }
  }

  async refreshToken(req: Request<{}, {}, RefreshTokenRequest>, res: Response) {
    try {
      const result = await authService.refreshToken(req.body);
      sendSuccess(res, result, 200); 
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      switch (errorMessage) {
        case 'REFRESH_TOKEN_EXPIRED':
          sendError(res, 'TOKEN_EXPIRED', 'El refresh token ha expirado', 401);
          break;
        case 'REFRESH_TOKEN_INVALID':
        case 'USER_NOT_FOUND':
          sendError(res, 'TOKEN_INVALID', 'Refresh token inválido', 401);
          break;
        default:
          sendError(res, 'REFRESH_ERROR', 'Error al refrescar el token', 500);
      }
    }
  }

  async changePassword(req: Request<{}, {}, ChangePasswordRequest>, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'UNAUTHORIZED', 'Usuario no autenticado', 401);
      }

      const result = await authService.changePassword(req.user.id, req.body);
      sendSuccess(res, result, 200); 
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      switch (errorMessage) {
        case 'USER_NOT_FOUND':
          sendError(res, 'USER_NOT_FOUND', 'Usuario no encontrado', 404);
          break;
        case 'CURRENT_PASSWORD_INVALID':
          sendError(res, 'INVALID_PASSWORD', 'La contraseña actual es incorrecta', 400);
          break;
        default:
          sendError(res, 'PASSWORD_CHANGE_ERROR', 'Error al cambiar la contraseña', 500);
      }
    }
  }

  async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'UNAUTHORIZED', 'Usuario no autenticado', 401);
      }

      const result = await authService.getCurrentUser(req.user.id);
      sendSuccess(res, result, 200); 
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      switch (errorMessage) {
        case 'USER_NOT_FOUND':
          sendError(res, 'USER_NOT_FOUND', 'Usuario no encontrado', 404);
          break;
        default:
          sendError(res, 'PROFILE_ERROR', 'Error al obtener el perfil', 500);
      }
    }
  }

  async logout(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'UNAUTHORIZED', 'Usuario no autenticado', 401);
      }

      const result = await authService.logout(req.user.id);
      sendSuccess(res, result, 200); 
    } catch (error: unknown) {
      sendError(res, 'LOGOUT_ERROR', 'Error al cerrar sesión', 500);
    }
  }
}

export const authController = new AuthController();