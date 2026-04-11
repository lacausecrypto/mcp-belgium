import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { flandersClient } from "../src/client.js";

describe("flandersClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searchDatasets explains that Datavindplaats now requires a key", async () => {
    await expect(flandersClient.searchDatasets("ruimte", undefined, undefined, 10)).rejects.toThrow(
      "Datavindplaats now requires an API key"
    );
  });
});
