import { GatewayDispatchEvents } from 'discord-api-types/v10';
import { applyGatewayPatch } from './src/core/GatewayPatcher.js';
import { ClientQuest } from './src/core/Client.js';
import { QuestRunner } from './src/quest/QuestRunner.js';
import { WatchVideoStrategy } from './src/quest/strategies/WatchVideoStrategy.js';
import { PlayOnDesktopStrategy } from './src/quest/strategies/PlayOnDesktopStrategy.js';
import { StreamStrategy } from './src/quest/strategies/StreamStrategy.js';
import { PlayActivityStrategy } from './src/quest/strategies/PlayActivityStrategy.js';
import { Logger } from './src/ui/Logger.js';
import { Dashboard, type FinalReportRow } from './src/ui/Dashboard.js';
import { printBanner, printStartupInfo } from './src/ui/Banner.js';
import { loadEnv } from './src/config/env.js';
import type { ActiveQuestState, UserInfo } from './src/types/index.js';

const env = loadEnv();
applyGatewayPatch();
printBanner();
printStartupInfo(env.TOKEN, { env, startedAt: new Date(), version: '2.0.0' });

const client = new ClientQuest(env.TOKEN);
const logger = Logger.create('Boot');

const runner = new QuestRunner([
  new WatchVideoStrategy(),
  new PlayOnDesktopStrategy(),
  new StreamStrategy(),
  new PlayActivityStrategy(),
]);

let dashboardInterval: NodeJS.Timeout | undefined;
let activeQuests: ActiveQuestState[] = [];
let started = false;

async function shutdown(signal: string): Promise<void> {
  Logger.setLiveMode(false);
  Dashboard.stopLive();
  logger.warn(`Received ${signal} - shutting down gracefully...`);
  if (dashboardInterval) {
    clearInterval(dashboardInterval);
  }
  await client.shutdown();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('uncaughtException', (err) => {
  Logger.setLiveMode(false);
  Dashboard.stopLive();
  logger.error(err);
  process.exit(1);
});

async function runAutomation(user: UserInfo): Promise<void> {
  if (started) return;
  started = true;

  logger.success(`Logged in as ${user.username} (${user.id})`);
  Logger.separator('Quest Automation');

  const manager = await client.fetchQuests();
  const validQuests = manager.filterValid();

  if (validQuests.length === 0) {
    logger.warn('No valid quests found. Nothing to do.');
    await client.shutdown();
    process.exit(0);
  }

  logger.info(`Found ${validQuests.length} valid quest(s) to complete`);

  activeQuests = validQuests.map((quest) => ({
    id: quest.id,
    name: quest.questName,
    taskType: quest.resolveTaskType(),
    reward: quest.getRewardName(),
    remaining: quest.getSecondsNeeded() - quest.getProgressSeconds(),
    total: quest.getSecondsNeeded(),
    status: 'pending',
  }));

  Dashboard.startLive();
  Logger.setLiveMode(true);
  Dashboard.renderScreen(user, activeQuests);
  dashboardInterval = setInterval(() => {
    activeQuests.forEach((aq) => {
      if (aq.status === 'running' && aq.remaining > 0) aq.remaining--;
      if (aq.remaining <= 0 && aq.status === 'running') aq.status = 'done';
    });
    Dashboard.renderScreen(user, activeQuests);
  }, 1_000);

  const ctx = {
    rest: client.rest,
    logger: Logger.create('Strategy'),
    dryRun: env.DRY_RUN,
    onProgress: (questId: string, current: number, total: number) => {
      const aq = activeQuests.find((q) => q.id === questId);
      if (aq) {
        aq.remaining = Math.max(0, total - current);
        aq.status = 'running';
      }
    },
  };

  activeQuests.forEach((aq) => {
    aq.status = 'running';
  });

  const results = await runner.runAll(validQuests, ctx, env.QUEST_CONCURRENCY);

  results.forEach((result, i) => {
    const aq = activeQuests[i];
    if (!aq) return;
    if (result.status === 'fulfilled') {
      aq.status = result.value.success ? 'done' : 'unsupported';
    } else {
      aq.status = 'failed';
      aq.error = (result.reason as Error)?.message ?? 'Unknown error';
    }
  });

  if (dashboardInterval) {
    clearInterval(dashboardInterval);
  }
  Dashboard.renderScreen(user, activeQuests);
  Logger.setLiveMode(false);
  Dashboard.stopLive();

  Logger.separator('Final Report');
  const reportRows: FinalReportRow[] = results.map((result, i) => {
    const quest = validQuests[i];
    const aq = activeQuests[i];
    const error = result.status === 'rejected' ? (result.reason as Error)?.message : aq?.error;
    return {
      name: quest?.questName ?? 'Unknown',
      taskType: quest?.resolveTaskType() ?? 'UNKNOWN',
      reward: quest?.getRewardName() ?? 'N/A',
      durationMs: result.status === 'fulfilled' ? result.value.durationMs : 0,
      success: result.status === 'fulfilled' && result.value.success,
      ...(error ? { error } : {}),
    };
  });
  Dashboard.renderFinalReport(reportRows);

  logger.success('All tasks finished.');
  setTimeout(() => process.exit(0), 1_500);
}

client.once(GatewayDispatchEvents.Ready, async ({ data }) => {
  await runAutomation(data.user as UserInfo);
});

await client.connect();

setTimeout(async () => {
  if (started) return;
  logger.warn('Gateway connected but READY event not received. Falling back to REST-only mode.');
  const me = (await client.rest.get('/users/@me')) as UserInfo;
  await runAutomation(me);
}, 15_000);
