// src/modules/auth/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../core/config/database.js';
import { env } from '../../core/config/env.js';
import { sendError } from '../../core/utils/response.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string; 
    employeeId?: string | null; 
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return sendError(res, 'UNAUTHORIZED', 'Token de autenticación requerido', 401);
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        email: true, 
        role: true, 
        employeeId: true 
      }
    });

    if (!user) {
      return sendError(res, 'UNAUTHORIZED', 'Usuario no encontrado', 401);
    }

    req.user = user; 
    next();
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      return sendError(res, 'TOKEN_EXPIRED', 'Token expirado', 401);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return sendError(res, 'TOKEN_INVALID', 'Token inválido', 403);
    }
    
    console.error('Error en autenticación:', error);
    return sendError(res, 'AUTH_ERROR', 'Error de autenticación', 500);
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Usuario no autenticado', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 'FORBIDDEN', 'No tienes permisos para esta acción', 403);
    }

    next();
  };
};