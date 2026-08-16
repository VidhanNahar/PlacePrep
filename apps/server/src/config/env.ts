import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env variables from process environment
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().default('http://localhost:5173'),

  // PostgreSQL Database connection string (e.g. from Supabase or direct PostgreSQL)
  DATABASE_URL: z.string({
    required_error: 'DATABASE_URL is required in .env for PostgreSQL / Supabase connection',
  }),

  DIRECT_URL: z.string().optional(),

  // Supabase Configuration
  SUPABASE_URL: z.string({
    required_error: 'SUPABASE_URL is required in .env',
  }),
  SUPABASE_ANON_KEY: z.string({
    required_error: 'SUPABASE_ANON_KEY is required in .env',
  }),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_JWT_SECRET: z.string().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Environment configuration error in .env:');
  for (const issue of _env.error.issues) {
    console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
  }
  // In development, provide helpful guide instead of hard crash if user is creating .env
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Invalid production environment configuration');
  }
}

export const env = _env.success
  ? _env.data
  : {
      NODE_ENV: 'development' as const,
      PORT: Number(process.env.PORT) || 5000,
      CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/placeprep?schema=public',
      DIRECT_URL: process.env.DIRECT_URL,
      SUPABASE_URL: process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET,
      RATE_LIMIT_WINDOW_MS: 60000,
      RATE_LIMIT_MAX_REQUESTS: 100,
    };
