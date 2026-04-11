export class UpstreamApiError extends Error {
  constructor(
    public readonly source: string,
    public readonly statusCode: number,
    public readonly upstreamUrl: string,
    message: string
  ) {
    super(`[${source}] HTTP ${statusCode}: ${message}`);
    this.name = "UpstreamApiError";
  }
}

export class RateLimitError extends Error {
  constructor(public readonly source: string, public readonly retryAfterMs: number) {
    super(`[${source}] Rate limited. Retry after ${retryAfterMs}ms`);
    this.name = "RateLimitError";
  }
}
