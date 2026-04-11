import { beforeEach, describe, expect, it, vi } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAll } from "../src/register.js";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("mcp-belgium aggregated domain tools", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates to the iRail tool set through the aggregated server", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        station: [
          {
            id: "BE.NMBS.008892007",
            name: "Bruxelles-Central",
            standardname: "Brussels-Central/Brussel-Centraal",
            locationX: "4.357",
            locationY: "50.846",
          },
        ],
      }),
    });

    const server = new McpServer(
      { name: "test-belgium", version: "0.1.0" },
      { capabilities: { tools: {}, resources: {}, prompts: {} } }
    );
    registerAll(server);

    const client = new Client({ name: "test-client", version: "0.1.0" }, { capabilities: {} });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    const result = await client.callTool({
      name: "irail_search_stations",
      arguments: { query: "central" },
    });

    expect(result.isError).toBeFalsy();
    expect((result.content[0] as { text: string }).text).toContain("Bruxelles-Central");
  });
});
