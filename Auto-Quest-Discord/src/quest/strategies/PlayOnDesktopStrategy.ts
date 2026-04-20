import { QuestTaskType } from '@app-types/index.js';
import type { HeartbeatBody, QuestTaskType as QTaskType, QuestUserStatus } from '@app-types/index.js';
import type { Quest } from '@quest/Quest.entity.js';
import type { IQuestStrategy, QuestResult, StrategyContext } from './IQuestStrategy.js';
import { Logger } from '@ui/Logger.js';
import { withRetry } from '@utils/retry.js';
import { sleep } from '@utils/sleep.js';

export class PlayOnDesktopStrategy implements IQuestStrategy {
  readonly taskTypes = [QuestTaskType.PLAY_ON_DESKTOP] as const;
  private readonly logger = Logger.create('PlayOnDesktopStrategy');

  canHandle(taskType: QTaskType): boolean {
    return this.taskTypes.some((t) => t === taskType);
  }

  async execute(quest: Quest, ctx: StrategyContext): Promise<QuestResult> {
    const startMs = Date.now();
    const secondsNeeded = quest.getSecondsNeeded();
    const intervalMs = 60_000;

    if (ctx.dryRun) {
      ctx.onProgress?.(quest.id, secondsNeeded, secondsNeeded);
      return {
        questId: quest.id,
        success: true,
        reward: quest.getRewardName(),
        durationMs: Date.now() - startMs,
      };
    }

    while (!quest.isCompleted()) {
      const body: HeartbeatBody = {
        application_id: quest.applicationId,
        terminal: false,
      };
      const status = await withRetry(async () => {
        return (await ctx.rest.post(`/quests/${quest.id}/heartbeat`, { body })) as QuestUserStatus;
      });
      quest.updateUserStatus(status);

      const secondsDone = quest.getProgressSeconds();
      this.logger.info(`Heartbeat sent — ${secondsDone}/${secondsNeeded}s`);
      ctx.onProgress?.(quest.id, secondsDone, secondsNeeded);
      if (quest.isCompleted()) {
        break;
      }
      await sleep(intervalMs);
    }

    await withRetry(async () => {
      const body: HeartbeatBody = { application_id: quest.applicationId, terminal: true };
      return ctx.rest.post(`/quests/${quest.id}/heartbeat`, { body });
    });

    this.logger.success(`Quest "${quest.questName}" completed!`);
    return {
      questId: quest.id,
      success: true,
      reward: quest.getRewardName(),
      durationMs: Date.now() - startMs,
    };
  }
}
