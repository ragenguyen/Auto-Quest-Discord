import type { REST } from '@discordjs/rest';
import type { Logger } from '@ui/Logger.js';
import type { Quest } from '@quest/Quest.entity.js';
import type { QuestTaskType } from '@app-types/index.js';

export interface StrategyContext {
  readonly rest: REST;
  readonly logger: Logger;
  readonly dryRun: boolean;
  onProgress?: (questId: string, current: number, total: number) => void;
}

export interface QuestResult {
  questId: string;
  success: boolean;
  reward: string;
  durationMs: number;
  error?: string;
}

export interface IQuestStrategy {
  readonly taskTypes: ReadonlyArray<QuestTaskType>;
  canHandle(taskType: QuestTaskType): boolean;
  execute(quest: Quest, ctx: StrategyContext): Promise<QuestResult>;
}

export class UnsupportedTaskError extends Error {
  constructor(taskType: QuestTaskType) {
    super(`Unsupported task type: ${taskType}`);
    this.name = 'UnsupportedTaskError';
  }
}
