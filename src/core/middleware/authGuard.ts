// src/core/middleware/authGuard.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js'; 
import { env } from '../config/env.js'; 
import { sendError } from '../utils/response.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        employeeId?: string | null; 
      };
    }
  }
}

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'UNAUTHORIZED', 'Token de autenticación requerido', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        email: true, 
        role: true, 
        employeeId: true,
      },
    });

    if (!user) {
      return sendError(res, 'UNAUTHORIZED', 'Usuario no encontrado', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return sendError(res, 'TOKEN_EXPIRED', 'Token expirado', 401);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return sendError(res, 'TOKEN_INVALID', 'Token inválido', 401);
    }
    return sendError(res, 'AUTH_ERROR', 'Error de autenticación', 500); 
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Usuario no autenticado', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 'FORBIDDEN', 'No tienes permisos para realizar esta acción', 403);
    }

    next();
  };
};