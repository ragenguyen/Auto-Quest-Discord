import { withRetry } from '@utils/retry.js';
import { sleep } from '@utils/sleep.js';
import type { QuestTaskType, VideoProgressBody, VideoProgressResponse } from '@app-types/index.js';
import { QuestTaskType as TaskType } from '@app-types/index.js';
import type { Quest } from '@quest/Quest.entity.js';
import type { IQuestStrategy, QuestResult, StrategyContext } from './IQuestStrategy.js';
import { Logger } from '@ui/Logger.js';

export class WatchVideoStrategy implements IQuestStrategy {
  readonly taskTypes = [TaskType.WATCH_VIDEO, TaskType.WATCH_VIDEO_ON_MOBILE] as const;
  private readonly logger = Logger.create('WatchVideoStrategy');

  canHandle(taskType: QuestTaskType): boolean {
    return this.taskTypes.some((t) => t === taskType);
  }

  async execute(quest: Quest, ctx: StrategyContext): Promise<QuestResult> {
    const startedAt = Date.now();
    const secondsNeeded = quest.getSecondsNeeded();
    let secondsDone = quest.getProgressSeconds();
    const enrolledAt = quest.getEnrolledAt();
    const maxFuture = 10;
    const speed = 7;
    const interval = 1_000;

    if (ctx.dryRun) {
      ctx.onProgress?.(quest.id, secondsNeeded, secondsNeeded);
      return {
        questId: quest.id,
        success: true,
        reward: quest.getRewardName(),
        durationMs: Date.now() - startedAt,
      };
    }

    let completed = false;
    while (secondsDone < secondsNeeded) {
      const nowMs = Date.now();
      const maxAllowed = Math.floor((nowMs - enrolledAt) / 1_000) + maxFuture;
      const canClaim = maxAllowed - secondsDone >= speed;
      if (!canClaim) {
        await sleep(interval);
        continue;
      }

      const next = Math.min(secondsNeeded, secondsDone + speed + Math.random());
      const body: VideoProgressBody = { timestamp: next };
      const response = await withRetry(async () => {
        return (await ctx.rest.post(`/quests/${quest.id}/video-progress`, { body })) as VideoProgressResponse;
      }, { maxAttempts: 3, baseDelayMs: 1_000 });

      secondsDone = Math.floor(next);
      this.logger.info(`Progress ${secondsDone}/${secondsNeeded}s`);
      ctx.onProgress?.(quest.id, secondsDone, secondsNeeded);
      if (response.completed_at || secondsDone >= secondsNeeded) {
        completed = true;
        break;
      }
      await sleep(interval);
    }

    if (!completed) {
      const body: VideoProgressBody = { timestamp: secondsNeeded };
      await withRetry(async () => {
        return ctx.rest.post(`/quests/${quest.id}/video-progress`, { body });
      }, { maxAttempts: 3, baseDelayMs: 1_000 });
      ctx.onProgress?.(quest.id, secondsNeeded, secondsNeeded);
    }

    return {
      questId: quest.id,
      success: true,
      reward: quest.getRewardName(),
      durationMs: Date.now() - startedAt,
    };
  }
}
