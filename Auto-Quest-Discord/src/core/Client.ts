import { Client } from '@discordjs/core';
import { REST } from '@discordjs/rest';
import { WebSocketManager } from '@discordjs/ws';
import type { APIGatewayBotInfo } from 'discord-api-types/v10';
import { makeRequest } from './HttpAdapter.js';
import { QuestManager } from '@quest/QuestManager.js';
import { Logger } from '@ui/Logger.js';
import type { AllQuestsResponse } from '@app-types/index.js';
import { withRetry } from '@utils/retry.js';

export class ClientQuest extends Client {
  public questManager: QuestManager | null = null;
  public readonly websocketManager: WebSocketManager;
  private readonly logger = Logger.create('Client');

  constructor(token: string) {
    const rest = new REST({ version: '10', makeRequest }).setToken(token);

    const gateway = new WebSocketManager({
      token,
      intents: 0,
      rest,
    });

    gateway.fetchGatewayInformation = (_force?: boolean): Promise<APIGatewayBotInfo> => {
      return Promise.resolve({
        url: 'wss://gateway.discord.gg',
        shards: 1,
        session_start_limit: {
          total: 1000,
          remaining: 1000,
          reset_after: 14_400_000,
          max_concurrency: 1,
        },
      });
    };

    super({ rest, gateway });
    this.websocketManager = gateway;
    this.logger.debug('ClientQuest initialized');
  }

  async connect(): Promise<void> {
    this.logger.info('Connecting to Discord gateway...');
    await withRetry(async () => {
      await this.rest.get('/users/@me');
    });
    await withRetry(async () => {
      await Promise.race([
        this.websocketManager.connect(),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Gateway connect timeout after 45s')), 45_000);
        }),
      ]);
    });
    this.logger.success('Gateway connected');
  }

  async fetchQuests(): Promise<QuestManager> {
    this.logger.info('Fetching quests from API...');
    const response = await withRetry(async () => {
      return (await this.rest.get('/quests/@me')) as AllQuestsResponse;
    });
    this.questManager = QuestManager.fromResponse(this, response);
    this.logger.success(
      `Fetched ${this.questManager.size} quest(s) — ${this.questManager.filterValid().length} valid`,
    );
    return this.questManager;
  }

  async shutdown(): Promise<void> {
    this.logger.warn('Disconnecting WebSocket...');
    await withRetry(async () => {
      await this.websocketManager.destroy();
    });
    this.logger.info('Client shutdown complete');
  }
}
