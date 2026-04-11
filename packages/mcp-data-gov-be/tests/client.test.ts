import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { dataGovBeClient } from "../src/client.js";

describe("dataGovBeClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searchDatasets explains that the CKAN API is gone", async () => {
    await expect(dataGovBeClient.searchDatasets("budget", undefined, undefined, 10)).rejects.toThrow(
      "no longer exposes the CKAN /api/3/action endpoints"
    );
  });
});
