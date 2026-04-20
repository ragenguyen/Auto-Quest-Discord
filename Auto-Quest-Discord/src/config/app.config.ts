import type { AppConfig } from '@app-types/index.js';
import { loadEnv } from './env.js';

export function createAppConfig(version = '2.0.0'): AppConfig {
  return {
    env: loadEnv(),
    startedAt: new Date(),
    version,
  };
}
