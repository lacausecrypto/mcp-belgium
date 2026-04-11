import { beforeEach, describe, expect, it, vi } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAll } from "../src/register.js";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("mcp-data-gov-be tools", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a clear MCP error when the CKAN API is no longer available", async () => {
    const server = new McpServer({ name: "test-datagov", version: "0.1.0" }, { capabilities: { tools: {} } });
    registerAll(server);

    const client = new Client({ name: "test-client", version: "0.1.0" }, { capabilities: {} });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    const result = await client.callTool({
      name: "datagov_search_datasets",
      arguments: { query: "budget", rows: 10 },
    });

    expect(result.isError).toBeTruthy();
    expect((result.content[0] as { text: string }).text).toContain("no longer exposes the CKAN /api/3/action endpoints");
  });
});
