import type { QuestTaskType } from '@app-types/index.js';
import type { EnrollBody, QuestUserStatus } from '@app-types/index.js';
import type { Quest } from './Quest.entity.js';
import type { IQuestStrategy, QuestResult, StrategyContext } from './strategies/IQuestStrategy.js';
import { UnsupportedTaskError } from './strategies/IQuestStrategy.js';
import { Logger } from '@ui/Logger.js';
import { withRetry } from '@utils/retry.js';

export class QuestRunner {
  private readonly strategies: Map<QuestTaskType, IQuestStrategy>;
  private readonly logger = Logger.create('QuestRunner');

  constructor(strategies: IQuestStrategy[]) {
    this.strategies = new Map();
    for (const strategy of strategies) {
      for (const taskType of strategy.taskTypes) {
        this.strategies.set(taskType, strategy);
      }
    }
  }

  async run(quest: Quest, ctx: StrategyContext): Promise<QuestResult> {
    const taskType = quest.resolveTaskType();
    const strategy = this.strategies.get(taskType);
    if (!strategy) {
      throw new UnsupportedTaskError(taskType);
    }

    if (!quest.isEnrolled()) {
      const body: EnrollBody = { location: 11, is_targeted: false, metadata_raw: null };
      const enrolled = await withRetry(async () => {
        return (await ctx.rest.post(`/quests/${quest.id}/enroll`, { body })) as QuestUserStatus;
      });
      quest.updateUserStatus(enrolled);
    }

    const startMs = Date.now();
    const result = await strategy.execute(quest, ctx);
    return {
      ...result,
      durationMs: result.durationMs || Date.now() - startMs,
    };
  }

  async runAll(
    quests: Quest[],
    ctx: StrategyContext,
    concurrency = 1,
  ): Promise<PromiseSettledResult<QuestResult>[]> {
    const settledResults: PromiseSettledResult<QuestResult>[] = [];
    const safeConcurrency = Math.max(1, concurrency);

    for (let i = 0; i < quests.length; i += safeConcurrency) {
      const batch = quests.slice(i, i + safeConcurrency);
      this.logger.info(
        `Running batch ${Math.floor(i / safeConcurrency) + 1}/${Math.ceil(quests.length / safeConcurrency)} (${batch.length} quest(s))`,
      );
      const batchResults = await Promise.allSettled(batch.map((quest) => this.run(quest, ctx)));
      settledResults.push(...batchResults);
    }

    return settledResults;
  }
}
