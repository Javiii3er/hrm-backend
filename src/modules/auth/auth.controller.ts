// src/modules/auth/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
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
    
    login = async (req: Request<{}, {}, LoginRequest>, res: Response, next: NextFunction) => {
        try {

            console.log('*** DEBUG: Petición de LOGIN recibida para:', req.body.email); 
            
            const result = await authService.login(req.body);
            

            console.log('*** DEBUG: Login EXITOSO para:', req.body.email); 
            
            sendSuccess(res, result, 200); 
        } catch (error: unknown) { 
     
            console.error('*** ERROR EN EL CONTROLADOR DE LOGIN:', error); 

            if (!(error instanceof Error)) {
                return next(error); 
            }
            
            const errorMessage = error.message;
            
            switch (errorMessage) {
                case 'CREDENTIALS_INVALID':
                    sendError(res, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos', 401);
                    break;
                default:
                    next(error); 
            }
        }
    }

    refreshToken = async (req: Request<{}, {}, RefreshTokenRequest>, res: Response, next: NextFunction) => {
        try {
            const result = await authService.refreshToken(req.body);
            sendSuccess(res, result, 200); 
        } catch (error: unknown) {
            if (!(error instanceof Error)) {
                return next(error); 
            }
            const errorMessage = error.message;
            
            switch (errorMessage) {
                case 'REFRESH_TOKEN_EXPIRED':
                    sendError(res, 'TOKEN_EXPIRED', 'El refresh token ha expirado', 401);
                    break;
                case 'REFRESH_TOKEN_INVALID':
                case 'USER_NOT_FOUND':
                    sendError(res, 'TOKEN_INVALID', 'Refresh token inválido', 401);
                    break;
                default:
                    next(error);
            }
        }
    }

    changePassword = async (req: Request<{}, {}, ChangePasswordRequest>, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return sendError(res, 'UNAUTHORIZED', 'Usuario no autenticado', 401);
            }

            const result = await authService.changePassword(req.user.id, req.body);
            sendSuccess(res, result, 200); 
        } catch (error: unknown) {
            if (!(error instanceof Error)) {
                return next(error); 
            }
            const errorMessage = error.message;
            
            switch (errorMessage) {
                case 'USER_NOT_FOUND':
                    sendError(res, 'USER_NOT_FOUND', 'Usuario no encontrado', 404);
                    break;
                case 'CURRENT_PASSWORD_INVALID':
                    sendError(res, 'INVALID_PASSWORD', 'La contraseña actual es incorrecta', 400);
                    break;
                default:
                    next(error);
            }
        }
    }

    getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return sendError(res, 'UNAUTHORIZED', 'Usuario no autenticado', 401);
            }

            const result = await authService.getCurrentUser(req.user.id);
            sendSuccess(res, result, 200); 
        } catch (error: unknown) {
            if (!(error instanceof Error)) {
                return next(error); 
            }
            const errorMessage = error.message;
            
            switch (errorMessage) {
                case 'USER_NOT_FOUND':
                    sendError(res, 'USER_NOT_FOUND', 'Usuario no encontrado', 404);
                    break;
                default:
                    next(error);
            }
        }
    }

    logout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return sendError(res, 'UNAUTHORIZED', 'Usuario no autenticado', 401);
            }

            const result = await authService.logout(req.user.id);
            sendSuccess(res, result, 200); 
        } catch (error: unknown) {
            next(error);
        }
    }
}

export const authController = new AuthController();