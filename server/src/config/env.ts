import dotenv from 'dotenv';
import path from 'path';

// Load .env from the server root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_ANON_KEY: string;
  OPENROUTER_API_KEY: string;
  SARVAM_API_KEY: string;
  HF_TOKEN: string;
  GROQ_API_KEY: string;
  FRONTEND_URL: string;
  DATABASE_URL: string | undefined;
}

function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getOptionalEnvVar(key: string): string | undefined {
  return process.env[key];
}

export const env: EnvConfig = {
  PORT: parseInt(getEnvVar('PORT', '3000'), 10),
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  SUPABASE_URL: getEnvVar('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
  SUPABASE_ANON_KEY: getEnvVar('SUPABASE_ANON_KEY'),
  OPENROUTER_API_KEY: getEnvVar('OPENROUTER_API_KEY'),
  SARVAM_API_KEY: getEnvVar('SARVAM_API_KEY'),
  HF_TOKEN: getEnvVar('HF_TOKEN'),
  GROQ_API_KEY: getEnvVar('GROQ_API_KEY'),
  FRONTEND_URL: getEnvVar('FRONTEND_URL', 'http://localhost:5173'),
  DATABASE_URL: getOptionalEnvVar('DATABASE_URL'),
};
