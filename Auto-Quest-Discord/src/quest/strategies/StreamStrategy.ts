import { QuestTaskType, type QuestTaskType as QTaskType } from '@app-types/index.js';
import type { Quest } from '@quest/Quest.entity.js';
import type { IQuestStrategy, QuestResult, StrategyContext } from './IQuestStrategy.js';
import { Logger } from '@ui/Logger.js';

export class StreamStrategy implements IQuestStrategy {
  readonly taskTypes = [QuestTaskType.STREAM_ON_DESKTOP] as const;
  private readonly logger = Logger.create('StreamStrategy');

  canHandle(taskType: QTaskType): boolean {
    return this.taskTypes.some((t) => t === taskType);
  }

  async execute(quest: Quest, _ctx: StrategyContext): Promise<QuestResult> {
    this.logger.warn('Task type STREAM_ON_DESKTOP is not supported in Node.js...');
    return {
      questId: quest.id,
      success: false,
      reward: 'N/A',
      durationMs: 0,
      error: 'Unsupported in CLI',
    };
  }
}
