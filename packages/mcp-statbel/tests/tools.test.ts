import { beforeEach, describe, expect, it, vi } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAll } from "../src/register.js";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("mcp-statbel tools", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("searches views and reads one through MCP", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: "view-1", name: "Population by municipality", locale: "en", lastPublishDate: 1 }],
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ facts: [{ Municipality: "Namur", Population: 113000 }] }) });

    const server = new McpServer({ name: "test-statbel", version: "0.1.0" }, { capabilities: { tools: {} } });
    registerAll(server);
    const client = new Client({ name: "test-client", version: "0.1.0" }, { capabilities: {} });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    const search = await client.callTool({ name: "statbel_search_datasets", arguments: { query: "municipality" } });
    expect(search.isError).toBeFalsy();
    expect((search.content as Array<{ text: string }>)[0].text).toContain("view-1");

    const view = await client.callTool({ name: "statbel_get_view", arguments: { viewId: "view-1" } });
    expect(view.isError).toBeFalsy();
    expect(JSON.parse((view.content as Array<{ text: string }>)[0].text)).toMatchObject({
      totalFacts: 1,
      facts: [{ Municipality: "Namur", Population: 113000 }],
    });
  });
});
