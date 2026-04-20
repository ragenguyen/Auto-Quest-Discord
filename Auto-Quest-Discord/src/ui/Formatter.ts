import chalk from 'chalk';

export function formatTime(seconds: number): string {
  if (seconds <= 0) return chalk.bold.green('✔ DONE');
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return `${str.slice(0, Math.max(0, maxLen - 1))}…`;
}

export function padStart(str: string, width: number): string {
  return str.padStart(width, ' ');
}

export function colorTime(seconds: number): string {
  if (seconds <= 0) return chalk.bold.green(formatTime(seconds));
  if (seconds < 60) return chalk.red(formatTime(seconds));
  if (seconds < 300) return chalk.yellow(formatTime(seconds));
  return chalk.white(formatTime(seconds));
}
