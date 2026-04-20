export type LogLevel = 'DEBUG' | 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';

export interface AppEnv {
  readonly TOKEN: string;
  readonly LOG_LEVEL: LogLevel;
  readonly DRY_RUN: boolean;
  readonly RETRY_MAX: number;
  readonly RETRY_BASE_DELAY_MS: number;
  readonly QUEST_CONCURRENCY: number;
}

export interface AppConfig {
  readonly env: AppEnv;
  readonly startedAt: Date;
  readonly version: string;
}
