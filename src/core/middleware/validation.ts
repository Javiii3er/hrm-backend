// src/core/middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendError } from '../utils/response.js';

export const validate = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.reduce((acc: any, curr) => {
          const path = curr.path.join('.');
          acc[path] = curr.message;
          return acc;
        }, {});
        
        return sendError(
          res, 
          'VALIDATION_ERROR', 
          'Error de validación', 
          422, 
          details
        );
      }
      next(error);
    }
  };
};