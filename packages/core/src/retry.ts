import { UpstreamApiError } from "./errors.js";

export interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

const DEFAULT_RETRY: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 500,
  maxDelayMs: 5000,
};

/** Client errors are deterministic: only network failures, timeouts, 408, 429 and 5xx are retried. */
export function isRetryable(err: unknown): boolean {
  if (err instanceof UpstreamApiError) {
    return err.statusCode >= 500 || err.statusCode === 408 || err.statusCode === 429;
  }
  return true;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: Partial<RetryOptions> = {}
): Promise<T> {
  const { maxRetries, baseDelayMs, maxDelayMs } = { ...DEFAULT_RETRY, ...opts };

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries || !isRetryable(err)) throw err;
      const delay = Math.min(baseDelayMs * 2 ** attempt + Math.random() * 100, maxDelayMs);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("unreachable");
}
