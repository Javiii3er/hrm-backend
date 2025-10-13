// src/core/utils/response.ts

import { Response } from 'express';

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    [key: string]: any;
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Envía una respuesta de éxito estandarizada (SuccessResponse).
 * @param res Objeto de respuesta de Express.
 * @param data Datos a devolver.
 * @param statusCode Código de estado HTTP (por defecto 200).
 * @param options Opciones que pueden incluir 'message' y 'meta'.
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  options?: {
    message?: string;
    meta?: any;
  }
): void => {
  const response: SuccessResponse<T> = {
    success: true,
    data,
  };

  if (options?.message) {
    response.message = options.message;
  }

  if (options?.meta) {
    response.meta = options.meta;
  }

  res.status(statusCode).json(response);
};

/**
 * Envía una respuesta de error estandarizada (ErrorResponse).
 * @param res Objeto de respuesta de Express.
 * @param code Código interno del error.
 * @param message Mensaje del error.
 * @param statusCode Código de estado HTTP (por defecto 500).
 * @param details Detalles adicionales (ej: lista de errores de validación).
 */
export const sendError = (
  res: Response,
  code: string,
  message: string,
  statusCode: number = 500,
  details?: any 
): void => {
  const response: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };

  res.status(statusCode).json(response);
};