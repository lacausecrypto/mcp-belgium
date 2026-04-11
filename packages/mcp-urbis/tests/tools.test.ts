import { beforeEach, describe, expect, it, vi } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAll } from "../src/register.js";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("mcp-urbis tools", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns WMS layer list through MCP", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () =>
        `<?xml version="1.0"?><WMS_Capabilities><Capability><Layer><Layer><Name>urbisFR</Name><Title>French base map</Title><CRS>EPSG:31370</CRS></Layer></Layer></Capability></WMS_Capabilities>`,
    });

    const server = new McpServer({ name: "test-urbis", version: "0.1.0" }, { capabilities: { tools: {} } });
    registerAll(server);

    const client = new Client({ name: "test-client", version: "0.1.0" }, { capabilities: {} });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    const result = await client.callTool({
      name: "urbis_list_layers",
      arguments: { service: "vector", query: "urbis", limit: 10 },
    });

    expect(result.isError).toBeFalsy();
    expect((result.content[0] as { text: string }).text).toContain("urbisFR");
  });
});
