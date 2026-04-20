import type { RawQuest, QuestTaskType, QuestUserStatus } from '@app-types/index.js';
import { Constants } from '@core/Constants.js';
import { QuestTaskType as TaskType } from '@app-types/index.js';
import { lookupQuest } from './QuestDatabase.js';

export class Quest {
  private readonly data: RawQuest;

  private constructor(data: RawQuest) {
    this.data = data;
  }

  static create(data: RawQuest): Quest {
    return new Quest(data);
  }

  get id(): string {
    return this.data.id;
  }
  get config() {
    return this.data.config;
  }
  get userStatus() {
    return this.data.user_status;
  }
  get targetedContent(): number {
    return this.data.targeted_content;
  }
  get preview(): boolean {
    return this.data.preview;
  }

  get questName(): string {
    return this.config.messages.quest_name ?? lookupQuest(this.id)?.name ?? this.id;
  }
  get applicationName(): string {
    return this.config.application.name;
  }
  get applicationId(): string {
    return this.config.application.id;
  }

  isExpired(ref: Date = new Date()): boolean {
    return ref.getTime() > new Date(this.config.expires_at).getTime();
  }
  isCompleted(): boolean {
    return Boolean(this.userStatus?.completed_at);
  }
  isEnrolled(): boolean {
    return Boolean(this.userStatus?.enrolled_at);
  }
  hasClaimedRewards(): boolean {
    return Boolean(this.userStatus?.claimed_at);
  }
  isExcluded(): boolean {
    return Constants.EXCLUDED_QUEST_IDS.has(this.id);
  }

  supportsTaskType(): boolean {
    return this.tryResolveTaskType() !== undefined;
  }

  tryResolveTaskType(): QuestTaskType | undefined {
    const tasks = this.config.task_config.tasks;
    const priority: QuestTaskType[] = [
      TaskType.WATCH_VIDEO,
      TaskType.WATCH_VIDEO_ON_MOBILE,
      TaskType.PLAY_ON_DESKTOP,
      TaskType.STREAM_ON_DESKTOP,
      TaskType.PLAY_ACTIVITY,
    ];
    const direct = priority.find((taskType) => Boolean(tasks[taskType]));
    if (direct) return direct;

    const dynamicTasks = tasks as Record<string, { event_name?: string } | undefined>;
    for (const [key, task] of Object.entries(dynamicTasks)) {
      const keyNorm = key.toUpperCase();
      const eventNorm = (task?.event_name ?? '').toUpperCase();
      if (keyNorm.includes('VIDEO') || eventNorm.includes('VIDEO')) {
        return keyNorm.includes('MOBILE') ? TaskType.WATCH_VIDEO_ON_MOBILE : TaskType.WATCH_VIDEO;
      }
      if (keyNorm.includes('PLAY') || eventNorm.includes('PLAY')) {
        if (keyNorm.includes('ACTIVITY') || eventNorm.includes('ACTIVITY')) {
          return TaskType.PLAY_ACTIVITY;
        }
        return TaskType.PLAY_ON_DESKTOP;
      }
      if (keyNorm.includes('STREAM') || eventNorm.includes('STREAM')) {
        return TaskType.STREAM_ON_DESKTOP;
      }
    }
    return undefined;
  }

  resolveTaskType(): QuestTaskType {
    const found = this.tryResolveTaskType();
    if (!found) {
      throw new Error(`No supported task found for quest ${this.id}`);
    }
    return found;
  }

  getSecondsNeeded(): number {
    const task = this.config.task_config.tasks[this.resolveTaskType()];
    return task?.target ?? lookupQuest(this.id)?.duration ?? 900;
  }

  getProgressSeconds(): number {
    const taskType = this.resolveTaskType();
    return this.userStatus?.progress?.[taskType]?.value ?? 0;
  }

  getRewardName(): string {
    const rewards = this.config.rewards_config.rewards;
    if (!rewards[0]) return 'Unknown';
    if (rewards[0].messages?.name) return rewards[0].messages.name;
    if (rewards[0].orb_quantity) return `${rewards[0].orb_quantity} Orbs`;
    return 'Reward';
  }

  getEnrolledAt(): number {
    const enrolledAt = this.userStatus?.enrolled_at;
    return enrolledAt ? new Date(enrolledAt).getTime() : Date.now();
  }

  updateUserStatus(status: QuestUserStatus): void {
    this.data.user_status = status;
  }
}
