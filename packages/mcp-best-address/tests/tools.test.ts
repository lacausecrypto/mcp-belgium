import { beforeEach, describe, expect, it, vi } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAll } from "../src/register.js";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("mcp-best-address tools", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns municipality search results through MCP", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [{ id: "municipality-1", name: { fr: "Bruxelles" } }],
        total: 1,
      }),
    });

    const server = new McpServer({ name: "test-best", version: "0.1.0" }, { capabilities: { tools: {} } });
    registerAll(server);

    const client = new Client({ name: "test-client", version: "0.1.0" }, { capabilities: {} });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    const result = await client.callTool({
      name: "best_search_municipalities",
      arguments: { name: "Bruxelles", limit: 10, page: 1 },
    });

    expect(result.isError).toBeFalsy();
    expect((result.content[0] as { text: string }).text).toContain("Bruxelles");
  });
});
