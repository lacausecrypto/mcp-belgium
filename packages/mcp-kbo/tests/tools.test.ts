import { beforeEach, describe, expect, it, vi } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAll } from "../src/register.js";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("mcp-kbo tools", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CBEAPI_KEY = "test-key";
  });

  it("returns enterprise search results through MCP", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        enterprises: [{ enterpriseNumber: "0123456789", name: "Example SRL" }],
      }),
    });

    const server = new McpServer({ name: "test-kbo", version: "0.1.0" }, { capabilities: { tools: {} } });
    registerAll(server);

    const client = new Client({ name: "test-client", version: "0.1.0" }, { capabilities: {} });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    const result = await client.callTool({
      name: "kbo_search_enterprise",
      arguments: { query: "Example", type: "name" },
    });

    expect(result.isError).toBeFalsy();
    expect((result.content[0] as { text: string }).text).toContain("Example SRL");
  });
});
