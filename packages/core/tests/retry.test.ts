import { describe, expect, it, vi } from "vitest";
import { UpstreamApiError } from "../src/errors.js";
import { withRetry } from "../src/retry.js";

const fast = { baseDelayMs: 1, maxDelayMs: 1 };

describe("withRetry", () => {
  it("does not retry deterministic 4xx client errors", async () => {
    const fn = vi.fn().mockRejectedValue(new UpstreamApiError("t", 404, "https://x", "not found"));
    await expect(withRetry(fn, fast)).rejects.toThrow("HTTP 404");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries 5xx, 429 and network errors until success", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new UpstreamApiError("t", 503, "https://x", "busy"))
      .mockRejectedValueOnce(new UpstreamApiError("t", 429, "https://x", "slow down"))
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValue("ok");
    await expect(withRetry(fn, fast)).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(4);
  });
});
