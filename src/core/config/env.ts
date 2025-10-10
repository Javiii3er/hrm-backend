// src/core/config/env.ts
import { z } from 'zod';
import { config } from 'dotenv';

config();



const envSchema = z.object({

  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3000'),

  DATABASE_URL: z.string().url(),

  JWT_SECRET: z.string().min(32),

  JWT_REFRESH_SECRET: z.string().min(32),

  JWT_EXPIRES_IN: z.string().default('15m'),

  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  UPLOAD_MAX_FILE_SIZE: z.string().transform(Number).pipe(z.number().min(1)).default('10485760'),

});

export const env = envSchema.parse(process.env);
export type EnvConfig = z.infer<typeof envSchema>;