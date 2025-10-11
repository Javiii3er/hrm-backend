// src/modules/documents/document.schemas.ts
import { z } from 'zod';

export const DocumentUploadSchema = z.object({
  tags: z.string().optional().default('').transform(val => val.split(',').map(t => t.trim()).filter(t => t.length > 0)),
  description: z.string().max(500, 'La descripción es demasiado larga').optional()
});

export const DocumentQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).default('1'),
  pageSize: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default('10'),
  tag: z.string().optional()
});

export type DocumentUploadDTO = z.infer<typeof DocumentUploadSchema>;
export type DocumentQueryDTO = z.infer<typeof DocumentQuerySchema>;