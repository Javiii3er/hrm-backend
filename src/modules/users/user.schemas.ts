// src/modules/users/user.schemas.ts
import { z } from 'zod';

export const UserCreateSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .max(100, 'El email es demasiado largo'),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(50, 'La contraseña es demasiado larga'),
  role: z.enum(['ADMIN', 'RRHH', 'EMPLEADO'])
    .default('EMPLEADO'),
  employeeId: z.string()
    .uuid('ID de empleado inválido')
    .optional()
    .nullable()
});

export const UserUpdateSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .max(100, 'El email es demasiado largo')
    .optional(),
  role: z.enum(['ADMIN', 'RRHH', 'EMPLEADO'])
    .optional(),
  employeeId: z.string()
    .uuid('ID de empleado inválido')
    .optional()
    .nullable()
});

export const UserQuerySchema = z.object({
  q: z.string().optional(),
  role: z.enum(['ADMIN', 'RRHH', 'EMPLEADO']).optional(),
  page: z.string().transform(Number).pipe(z.number().int().positive()).default('1'),
  pageSize: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default('10')
});

export const ChangeUserPasswordSchema = z.object({
  newPassword: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(50, 'La contraseña es demasiado larga')
});

export type UserCreateDTO = z.infer<typeof UserCreateSchema>;
export type UserUpdateDTO = z.infer<typeof UserUpdateSchema>;
export type UserQueryDTO = z.infer<typeof UserQuerySchema>;
export type ChangeUserPasswordDTO = z.infer<typeof ChangeUserPasswordSchema>;