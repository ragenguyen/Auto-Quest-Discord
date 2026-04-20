import chalk from 'chalk';
import figlet from 'figlet';
import type { AppConfig } from '@app-types/index.js';
import { Logger } from './Logger.js';

export function printBanner(): void {
  const text = figlet.textSync('AutoQuest', { font: 'Slant' });
  process.stdout.write(`${chalk.cyan(text)}\n`);
  process.stdout.write(`${chalk.gray('┌─────────────────────────────────────────────┐')}\n`);
  process.stdout.write(
    `${chalk.gray('│  v2.0.0  |  Node 22.x  |  discord.js core   │')}\n`,
  );
  process.stdout.write(`${chalk.gray('└─────────────────────────────────────────────┘')}\n`);
}

export function printStartupInfo(token: string, config: AppConfig): void {
  const tokenPreview = `${token.slice(0, 10)}***`;
  Logger.table(
    ['Key', 'Value'],
    [
      ['Token', tokenPreview],
      ['LOG_LEVEL', config.env.LOG_LEVEL],
      ['DRY_RUN', String(config.env.DRY_RUN)],
      ['RETRY_MAX', String(config.env.RETRY_MAX)],
    ],
    [20, 60],
  );
}
