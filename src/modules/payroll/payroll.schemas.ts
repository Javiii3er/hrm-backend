// src/modules/payroll/payroll.schemas.ts
import { z } from 'zod';

const dateString = z.string()
  .refine((str) => !isNaN(Date.parse(str)), 'Debe ser una fecha válida en formato ISO o YYYY-MM-DD')
  .transform((str) => new Date(str));

export const PayrollCreateSchema = z.object({
  periodStart: dateString,
  periodEnd: dateString,
  departmentId: z.string()
    .uuid('ID de departamento inválido')
    .optional(),
  description: z.string()
    .max(200, 'La descripción es demasiado larga')
    .optional()
});

export const PayrollUpdateSchema = PayrollCreateSchema.partial();

export const PayrollQuerySchema = z.object({
  startDate: z.string().refine((str) => !str || !isNaN(Date.parse(str)), 'Debe ser una fecha de inicio válida').optional(),
  endDate: z.string().refine((str) => !str || !isNaN(Date.parse(str)), 'Debe ser una fecha de fin válida').optional(),
  department: z.string().optional(),
  status: z.enum(['DRAFT', 'FINALIZED', 'PAID']).optional(),
  page: z.string().transform(Number).pipe(z.number().int().positive()).default('1'),
  pageSize: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default('10')
});

export const PayrollItemSchema = z.object({
  employeeId: z.string().uuid('ID de empleado inválido'),
  grossAmount: z.preprocess(
    (a) => parseFloat(z.string().parse(a)), 
    z.number()
      .positive('El monto bruto debe ser positivo')
      .max(1000000, 'El monto es demasiado alto')
  ),
  deductions: z.record(z.string(), z.number())
    .optional()
    .default({})
});

export const GeneratePayrollSchema = z.object({
  items: z.array(PayrollItemSchema).optional()
});

export type PayrollCreateDTO = z.infer<typeof PayrollCreateSchema>;
export type PayrollUpdateDTO = z.infer<typeof PayrollUpdateSchema>;
export type PayrollQueryDTO = z.infer<typeof PayrollQuerySchema>;
export type PayrollItemDTO = z.infer<typeof PayrollItemSchema>;
export type GeneratePayrollDTO = z.infer<typeof GeneratePayrollSchema>;