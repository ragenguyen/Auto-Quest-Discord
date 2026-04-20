import 'dotenv/config';
import type { AppEnv, LogLevel } from '@app-types/index.js';

const VALID_LOG_LEVELS: LogLevel[] = ['DEBUG', 'INFO', 'SUCCESS', 'WARN', 'ERROR'];

export function loadEnv(): AppEnv {
  const TOKEN = process.env['TOKEN'];
  if (!TOKEN || TOKEN.trim().length === 0) {
    throw new Error(
      '❌  Missing TOKEN environment variable.\n' +
        '   Copy .env.example → .env and set your Discord token.',
    );
  }

  const LOG_LEVEL = (process.env['LOG_LEVEL'] ?? 'INFO') as LogLevel;
  if (!VALID_LOG_LEVELS.includes(LOG_LEVEL)) {
    throw new Error(`Invalid LOG_LEVEL "${LOG_LEVEL}". Must be one of: ${VALID_LOG_LEVELS.join(', ')}`);
  }

  return {
    TOKEN: TOKEN.trim(),
    LOG_LEVEL,
    DRY_RUN: process.env['DRY_RUN'] === 'true',
    RETRY_MAX: parseInt(process.env['RETRY_MAX'] ?? '3', 10),
    RETRY_BASE_DELAY_MS: parseInt(process.env['RETRY_BASE_DELAY_MS'] ?? '1000', 10),
    QUEST_CONCURRENCY: parseInt(process.env['QUEST_CONCURRENCY'] ?? '1', 10),
  };
}
