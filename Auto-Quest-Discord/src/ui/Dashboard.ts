import chalk from 'chalk';
import Table from 'cli-table3';
import figlet from 'figlet';
import type { ActiveQuestState, UserInfo } from '@app-types/index.js';
import { formatTime, colorTime, truncate } from './Formatter.js';

export interface FinalReportRow {
  name: string;
  taskType: string;
  reward: string;
  durationMs: number;
  success: boolean;
  error?: string;
}

export class Dashboard {
  private static liveEnabled = false;

  static startLive(): void {
    if (Dashboard.liveEnabled) return;
    Dashboard.liveEnabled = true;
    process.stdout.write('\x1b[?1049h');
    process.stdout.write('\x1b[?25l');
  }

  static stopLive(): void {
    if (!Dashboard.liveEnabled) return;
    Dashboard.liveEnabled = false;
    process.stdout.write('\x1b[?25h');
    process.stdout.write('\x1b[?1049l');
  }

  static renderScreen(user: UserInfo, quests: ActiveQuestState[]): void {
    process.stdout.write('\x1b[H\x1b[J');
    const banner = figlet.textSync('AutoQuest', { font: 'Slant' });
    const running = quests.filter((q) => q.status === 'running').length;
    const done = quests.filter((q) => q.status === 'done').length;
    const failed = quests.filter((q) => q.status === 'failed').length;

    process.stdout.write(`${chalk.cyan(banner)}\n`);
    process.stdout.write(
      `${chalk.bold.green('SYSTEM RUNNING')} ` +
        `${chalk.gray('|')} ${chalk.blue(`Running: ${running}`)} ` +
        `${chalk.gray('|')} ${chalk.green(`Done: ${done}`)} ` +
        `${chalk.gray('|')} ${chalk.red(`Failed: ${failed}`)}\n\n`,
    );
    process.stdout.write(`${Dashboard.buildUserTable(user).toString()}\n\n`);
    process.stdout.write(`${chalk.bold.white('LIVE PROGRESS')}\n`);
    process.stdout.write(`${Dashboard.buildQuestTable(quests).toString()}\n\n`);
    process.stdout.write(`${chalk.gray('Press Ctrl+C to stop.')}\n`);
  }

  private static buildQuestTable(quests: ActiveQuestState[]): Table.Table {
    const table = new Table({
      head: ['No', 'Quest Name', 'Task Type', 'Reward', 'Time Left', 'Progress', 'Status'],
      colWidths: [5, 32, 22, 20, 12, 14, 14],
      wordWrap: true,
    });

    quests.forEach((quest, index) => {
      const status =
        quest.status === 'pending'
          ? chalk.gray('Pending')
          : quest.status === 'running'
            ? chalk.blue('Running')
            : quest.status === 'done'
              ? chalk.green('Done')
              : quest.status === 'failed'
                ? chalk.red('Failed')
                : chalk.yellow('Skip');

      const current = Math.max(0, quest.total - quest.remaining);
      const progress = quest.remaining <= 0 ? chalk.green('DONE') : `${current} / ${quest.total}s`;
      table.push([
        String(index + 1),
        truncate(quest.name, 30),
        truncate(quest.taskType, 20),
        truncate(quest.reward, 18),
        colorTime(quest.remaining),
        progress,
        status,
      ]);
    });
    return table;
  }

  private static buildUserTable(user: UserInfo): Table.Table {
    const table = new Table({
      head: ['Account', 'User ID', 'Node', 'Uptime'],
      colWidths: [28, 22, 14, 14],
    });

    const account = `${user.username}${user.global_name ? ` (${user.global_name})` : ''}`;
    table.push([
      chalk.yellow(account),
      chalk.cyan(user.id),
      chalk.gray(process.version),
      chalk.white(formatTime(Math.floor(process.uptime()))),
    ]);
    return table;
  }

  static renderFinalReport(results: FinalReportRow[]): void {
    const table = new Table({
      head: ['Quest Name', 'Task Type', 'Reward', 'Duration', 'Result'],
      colWidths: [32, 20, 20, 12, 12],
      wordWrap: true,
    });

    results.forEach((r) => {
      table.push([
        truncate(r.name, 30),
        r.taskType,
        truncate(r.reward, 18),
        `${Math.round(r.durationMs / 1_000)}s`,
        r.success ? chalk.green('SUCCESS') : chalk.red(r.error ? truncate(r.error, 10) : 'FAILED'),
      ]);
    });

    process.stdout.write(`${table.toString()}\n`);
  }
}
