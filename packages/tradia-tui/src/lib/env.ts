import { config as loadEnv } from 'dotenv';

export function loadEnvironment(): void {
  loadEnv({ path: '.env.local', quiet: true });
  loadEnv({ quiet: true });
}