import { beforeEach, describe, expect, it, vi } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAll } from "../src/register.js";

const mockFetch = vi.fn();
global.fetch = mockFetch;

async function connect() {
  const server = new McpServer({ name: "test-datagov", version: "0.1.0" }, { capabilities: { tools: {} } });
  registerAll(server);
  const client = new Client({ name: "test-client", version: "0.1.0" }, { capabilities: {} });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return client;
}

describe("mcp-data-gov-be tools", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("exposes the four datagov tools", async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([
      "datagov_get_dataset",
      "datagov_get_resource",
      "datagov_list_organizations",
      "datagov_search_datasets",
    ]);
  });

  it("returns search results through MCP", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ result: { count: 1, results: [{ id: "budget-2026", title: { en: "Budget 2026" } }] } }),
    });
    const client = await connect();

    const result = await client.callTool({ name: "datagov_search_datasets", arguments: { query: "budget-tool" } });

    expect(result.isError).toBeFalsy();
    const payload = JSON.parse((result.content as Array<{ text: string }>)[0].text);
    expect(payload.datasets[0]).toMatchObject({ id: "budget-2026", title: "Budget 2026" });
  });

  it("surfaces upstream failures as MCP errors", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404, text: async () => "not found" });
    const client = await connect();

    const result = await client.callTool({ name: "datagov_get_dataset", arguments: { datasetId: "nope" } });

    expect(result.isError).toBeTruthy();
    expect((result.content as Array<{ text: string }>)[0].text).toContain("Dataset lookup failed");
  });
});
