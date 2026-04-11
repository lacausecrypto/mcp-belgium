import { describe, expect, it, vi } from "vitest";
import { TokenBucket } from "../src/rate-limiter.js";

describe("TokenBucket", () => {
  it("serializes waiting callers instead of overspending tokens under concurrency", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-11T12:00:00.000Z"));

    const bucket = new TokenBucket(1, 100);
    const completionTimes: number[] = [];

    const tasks = [0, 1, 2].map(async () => {
      await bucket.acquire();
      completionTimes.push(Date.now());
    });

    await vi.runAllTimersAsync();
    await Promise.all(tasks);

    expect(completionTimes).toEqual([
      new Date("2026-04-11T12:00:00.000Z").getTime(),
      new Date("2026-04-11T12:00:00.100Z").getTime(),
      new Date("2026-04-11T12:00:00.200Z").getTime(),
    ]);

    vi.useRealTimers();
  });
});
