// src/modules/profile/profile.schemas.ts
import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  email: z
    .string()
    .email('Correo inválido')
    .max(100, 'El correo es demasiado largo')
    .optional(),
  newPassword: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(50, 'La contraseña es demasiado larga')
    .optional(),
});

export type UpdateProfileDTO = z.infer<typeof UpdateProfileSchema>;
