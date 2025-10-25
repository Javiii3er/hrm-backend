// src/modules/employees/employee.schemas.ts
import { z } from 'zod';

const EmployeeStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'VACATION']);

export const EmployeeCreateSchema = z.object({
  nationalId: z.string()
    .min(4, 'La cédula debe tener al menos 4 caracteres')
    .max(20, 'La cédula es demasiado larga'),
  firstName: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre es demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  lastName: z.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido es demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras y espacios'),
  email: z.string()
    .email('Email inválido')
    .max(100, 'El email es demasiado largo'),
  phone: z.string()
    .regex(/^[\+]?[0-9\s\-\(\)]{8,}$/, 'Número de teléfono inválido')
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val),

  // ✅ Cambio aquí: permitimos IDs como "dep-001"
  departmentId: z.string()
    .min(3, 'El departamento es obligatorio')
    .regex(/^[a-zA-Z0-9-_]+$/, 'Formato de ID de departamento inválido'),

  position: z.string()
    .min(2, 'El puesto debe tener al menos 2 caracteres')
    .max(100, 'El puesto es demasiado largo')
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val),
  hireDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe tener formato YYYY-MM-DD')
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val),
  status: EmployeeStatusEnum
    .default('ACTIVE')
});

// ✅ Igualamos el esquema de actualización
export const EmployeeUpdateSchema = EmployeeCreateSchema.partial();

export const EmployeeQuerySchema = z.object({
  q: z.string().optional(),
  department: z.string().optional(),
  status: EmployeeStatusEnum.optional(),
  page: z.string().transform(Number).pipe(z.number().int().positive()).default('1'),
  pageSize: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default('10')
});

export type EmployeeCreateDTO = z.infer<typeof EmployeeCreateSchema>;
export type EmployeeUpdateDTO = z.infer<typeof EmployeeUpdateSchema>;
export type EmployeeQueryDTO = z.infer<typeof EmployeeQuerySchema>;
