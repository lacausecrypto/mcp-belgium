export class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  private queue: Promise<void> = Promise.resolve();

  constructor(
    private readonly maxTokens: number,
    private readonly refillRateMs: number
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  acquire(): Promise<void> {
    const next = this.queue.then(async () => {
      while (true) {
        this.refill();
        if (this.tokens > 0) {
          this.tokens--;
          return;
        }

        const elapsed = Date.now() - this.lastRefill;
        const waitMs = Math.max(1, this.refillRateMs - elapsed);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    });

    this.queue = next.catch(() => undefined);
    return next;
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = Math.floor(elapsed / this.refillRateMs);
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
      this.lastRefill += tokensToAdd * this.refillRateMs;
    }
  }
}
