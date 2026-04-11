import { beforeEach, describe, expect, it, vi } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAll } from "../src/register.js";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("mcp-air-quality tools", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns nearby stations through MCP", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        stations: [{ id: 1, name: "Brussels" }],
      }),
    });

    const server = new McpServer({ name: "test-air-quality", version: "0.1.0" }, { capabilities: { tools: {} } });
    registerAll(server);

    const client = new Client({ name: "test-client", version: "0.1.0" }, { capabilities: {} });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    const result = await client.callTool({
      name: "airquality_search_stations",
      arguments: { latitude: 50.85, longitude: 4.35, radius: 10000 },
    });

    expect(result.isError).toBeFalsy();
    expect((result.content[0] as { text: string }).text).toContain("Brussels");
  });
});
