import chalk from 'chalk';
import figlet from 'figlet';
import Table from 'cli-table3';
import { getTimestamp } from '@utils/timestamp.js';
import type { LogLevel } from '@app-types/index.js';

const LEVEL_ORDER: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  SUCCESS: 2,
  WARN: 3,
  ERROR: 4,
};

const LEVEL_BADGES: Record<LogLevel, (msg: string) => string> = {
  DEBUG: (msg) => `${chalk.bgGray.white.bold('  DEBUG  ')} ${chalk.gray(msg)}`,
  INFO: (msg) => `${chalk.bgCyan.black.bold('  INFO   ')} ${chalk.cyan(msg)}`,
  SUCCESS: (msg) => `${chalk.bgGreen.black.bold('  OK     ')} ${chalk.green(msg)}`,
  WARN: (msg) => `${chalk.bgYellow.black.bold('  WARN   ')} ${chalk.yellow(msg)}`,
  ERROR: (msg) => `${chalk.bgRed.white.bold('  ERROR  ')} ${chalk.red(msg)}`,
};

export class Logger {
  private static liveMode = false;
  private readonly module: string;
  private readonly minLevel: number;

  private constructor(module: string, level: LogLevel = 'INFO') {
    this.module = module;
    this.minLevel = LEVEL_ORDER[level];
  }

  static create(module: string, level: LogLevel = 'INFO'): Logger {
    return new Logger(module, level);
  }

  static setLiveMode(enabled: boolean): void {
    Logger.liveMode = enabled;
  }

  static separator(label?: string): void {
    const width = Math.max(60, process.stdout.columns ?? 100);
    const text = label ? ` ${label} ` : '';
    const line = '-'.repeat(width);
    if (!label) {
      process.stdout.write(`${chalk.gray(line)}\n`);
      return;
    }
    const leftLen = Math.max(0, Math.floor((width - text.length) / 2));
    const rightLen = Math.max(0, width - leftLen - text.length);
    process.stdout.write(`${chalk.gray(`${'-'.repeat(leftLen)}${text}${'-'.repeat(rightLen)}`)}\n`);
  }

  static banner(title: string, subtitle?: string): void {
    const art = figlet.textSync(title, { font: 'Slant' });
    process.stdout.write(`${chalk.cyan(art)}\n`);
    if (subtitle) {
      const width = Math.max(40, subtitle.length + 4);
      const border = '─'.repeat(width - 2);
      process.stdout.write(`${chalk.cyan(`┌${border}┐`)}\n`);
      process.stdout.write(`${chalk.cyan(`│ ${subtitle.padEnd(width - 4)} │`)}\n`);
      process.stdout.write(`${chalk.cyan(`└${border}┘`)}\n`);
    }
  }

  static table(headers: string[], rows: string[][], colWidths?: number[]): void {
    const options: ConstructorParameters<typeof Table>[0] = {
      head: headers,
      wordWrap: true,
      style: { head: ['cyan'] },
    };
    if (colWidths) {
      options.colWidths = colWidths;
    }
    const table = new Table(options);
    for (const row of rows) {
      table.push(row);
    }
    process.stdout.write(`${table.toString()}\n`);
  }

  static progress(label: string, current: number, total: number): void {
    const safeTotal = total <= 0 ? 1 : total;
    const ratio = Math.max(0, Math.min(1, current / safeTotal));
    const width = 30;
    const filled = Math.round(ratio * width);
    const empty = width - filled;
    const bar = `${chalk.cyan('█'.repeat(filled))}${chalk.gray('░'.repeat(empty))}`;
    const pct = Math.round(ratio * 100);
    process.stdout.write(`${label} ${bar} ${pct}% (${current}/${total}s)\n`);
  }

  static startupInfo(tokenPrefix: string): void {
    Logger.table(
      ['Runtime', 'Value'],
      [
        ['Node', process.version],
        ['Platform', process.platform],
        ['Token', `${tokenPrefix}***`],
      ],
      [20, 60],
    );
  }

  debug(msg: string, ...meta: unknown[]): void {
    this.print('DEBUG', msg, meta);
  }

  info(msg: string, ...meta: unknown[]): void {
    this.print('INFO', msg, meta);
  }

  success(msg: string, ...meta: unknown[]): void {
    this.print('SUCCESS', msg, meta);
  }

  warn(msg: string, ...meta: unknown[]): void {
    this.print('WARN', msg, meta);
  }

  error(msg: string | Error, ...meta: unknown[]): void {
    this.print('ERROR', msg instanceof Error ? `${msg.name}: ${msg.message}` : msg, meta);
  }

  private print(level: LogLevel, msg: string, meta: unknown[]): void {
    if (LEVEL_ORDER[level] < this.minLevel) {
      return;
    }
    if (Logger.liveMode && level !== 'WARN' && level !== 'ERROR') {
      return;
    }
    const ts = chalk.gray(`[${getTimestamp()}]`);
    const module = chalk.magenta(`[${this.module}]`);
    const body = LEVEL_BADGES[level](msg);
    const extra = meta.length ? ` ${chalk.gray(meta.map((m) => JSON.stringify(m)).join(' '))}` : '';
    process.stdout.write(`${ts} ${body} ${module}${extra}\n`);
  }
}
