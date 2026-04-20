import type { ClientQuest } from '@core/Client.js';
import type { AllQuestsResponse, ApplicationData, EnrollBody, QuestUserStatus } from '@app-types/index.js';
import { Quest } from './Quest.entity.js';
import { Logger } from '@ui/Logger.js';
import { withRetry } from '@utils/retry.js';

export class QuestManager implements Iterable<Quest> {
  private readonly quests = new Map<string, Quest>();
  private readonly logger = Logger.create('QuestManager');
  public readonly client: ClientQuest;

  constructor(client: ClientQuest, quests: Quest[] = []) {
    this.client = client;
    for (const quest of quests) {
      this.quests.set(quest.id, quest);
    }
  }

  static fromResponse(client: ClientQuest, res: AllQuestsResponse): QuestManager {
    const quests = res.quests.map((q) => Quest.create(q));
    return new QuestManager(client, quests);
  }

  [Symbol.iterator](): IterableIterator<Quest> {
    return this.quests.values();
  }

  get size(): number {
    return this.quests.size;
  }

  list(): Quest[] {
    return [...this.quests.values()];
  }

  get(id: string): Quest | undefined {
    return this.quests.get(id);
  }

  upsert(quest: Quest): void {
    this.quests.set(quest.id, quest);
  }

  remove(id: string): boolean {
    return this.quests.delete(id);
  }

  clear(): void {
    this.quests.clear();
  }

  filterValid(): Quest[] {
    const base = this.list().filter((q) => !q.isExcluded() && !q.isCompleted() && !q.isExpired());
    const valid = base.filter((q) => q.supportsTaskType());
    const unsupportedCount = base.length - valid.length;
    if (unsupportedCount > 0) {
      this.logger.warn(`Skipping ${unsupportedCount} quest(s) with unsupported task types`);
    }
    return valid;
  }

  filterCompleted(): Quest[] {
    return this.list().filter((q) => q.isCompleted());
  }

  filterClaimable(): Quest[] {
    return this.list().filter((q) => q.isCompleted() && !q.hasClaimedRewards());
  }

  filterExpired(): Quest[] {
    return this.list().filter((q) => q.isExpired());
  }

  async enroll(questId: string): Promise<Quest | undefined> {
    const quest = this.get(questId);
    if (!quest) {
      this.logger.warn(`Quest ${questId} not found in manager`);
      return undefined;
    }
    const body: EnrollBody = {
      location: 11,
      is_targeted: false,
      metadata_raw: null,
    };
    const status = await withRetry(async () => {
      return (await this.client.rest.post(`/quests/${questId}/enroll`, { body })) as QuestUserStatus;
    });
    quest.updateUserStatus(status);
    this.upsert(quest);
    return quest;
  }

  async getApplicationData(applicationIds: string[]): Promise<ApplicationData[]> {
    const uniqueIds = [...new Set(applicationIds)];
    if (uniqueIds.length === 0) {
      return [];
    }
    return withRetry(async () => {
      return (await this.client.rest.get('/applications/public', {
        query: new URLSearchParams([['application_ids', uniqueIds.join(',')]]),
      })) as ApplicationData[];
    });
  }
}
