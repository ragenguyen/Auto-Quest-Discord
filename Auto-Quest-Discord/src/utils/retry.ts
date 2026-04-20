export interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitter: boolean;
  shouldRetry: (err: unknown) => boolean;
  onRetry: (attempt: number, err: unknown, delayMs: number) => void;
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  baseDelayMs: 1_000,
  maxDelayMs: 30_000,
  jitter: true,
  shouldRetry: () => true,
  onRetry: () => undefined,
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: Partial<RetryOptions> = {},
): Promise<T> {
  const options = { ...DEFAULT_OPTIONS, ...opts };
  let lastError: unknown;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (attempt === options.maxAttempts) {
        break;
      }
      if (!options.shouldRetry(err)) {
        break;
      }

      let delayMs = Math.min(options.baseDelayMs * Math.pow(2, attempt - 1), options.maxDelayMs);

      if (options.jitter) {
        const jitterFactor = 0.8 + Math.random() * 0.4;
        delayMs = Math.floor(delayMs * jitterFactor);
      }

      if (typeof err === 'object' && err !== null && 'status' in err) {
        const httpErr = err as { status?: number; rawError?: { retry_after?: number } };
        if (httpErr.status === 429 && httpErr.rawError?.retry_after) {
          delayMs = Math.ceil(httpErr.rawError.retry_after * 1_000) + 500;
        }
      }

      options.onRetry(attempt, err, delayMs);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}
