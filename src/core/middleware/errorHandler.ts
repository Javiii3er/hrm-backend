// src/core/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error no manejado:', error);

  // Error de validación de Zod
  if (error.name === 'ZodError') {
    return sendError(
      res,
      'VALIDATION_ERROR',
      'Error de validación',
      422,
      error.errors
    );
  }

  // Error de autenticación JWT
  if (error.name === 'JsonWebTokenError') {
    return sendError(res, 'TOKEN_INVALID', 'Token inválido', 401);
  }

  if (error.name === 'TokenExpiredError') {
    return sendError(res, 'TOKEN_EXPIRED', 'Token expirado', 401);
  }

  // Error de base de datos Prisma
  if (error.code?.startsWith('P')) {
    switch (error.code) {
      case 'P2002':
        return sendError(res, 'DUPLICATE_ENTRY', 'Registro duplicado', 409);
      case 'P2025':
        return sendError(res, 'NOT_FOUND', 'Registro no encontrado', 404);
      default:
        return sendError(res, 'DATABASE_ERROR', 'Error de base de datos', 500);
    }
  }

  // Error genérico
  const message = error.message || 'Error interno del servidor';
  const statusCode = error.statusCode || 500;

  sendError(res, 'INTERNAL_ERROR', message, statusCode);
};