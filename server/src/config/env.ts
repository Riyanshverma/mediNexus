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
  FRONTEND_URL: string;
}

function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env: EnvConfig = {
  PORT: parseInt(getEnvVar('PORT', '5000'), 10),
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  SUPABASE_URL: getEnvVar('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
  SUPABASE_ANON_KEY: getEnvVar('SUPABASE_ANON_KEY'),
  FRONTEND_URL: getEnvVar('FRONTEND_URL', 'http://localhost:5173'),
};
