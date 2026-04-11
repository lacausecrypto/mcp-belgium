import { describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAll } from "../src/register.js";

async function createConnectedPair() {
  const server = new McpServer(
    { name: "test-belgium", version: "0.1.0" },
    { capabilities: { tools: {}, resources: {}, prompts: {} } }
  );
  registerAll(server);

  const client = new Client({ name: "test-client", version: "0.1.0" }, { capabilities: {} });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return { client, server };
}

describe("mcp-belgium catalog", () => {
  it("lists catalog tools and aggregated domain tools", async () => {
    const { client } = await createConnectedPair();

    const tools = await client.listTools();
    const names = tools.tools.map((tool) => tool.name);

    expect(names).toContain("belgium_list_domains");
    expect(names).toContain("belgium_describe_domain");
    expect(names).toContain("irail_search_stations");
    expect(names).toContain("urbis_list_layers");
  });

  it("exposes catalog resources, per-domain resources, and the capability prompt", async () => {
    const { client } = await createConnectedPair();

    const resources = await client.listResources();
    expect(resources.resources.some((resource) => resource.uri === "belgium://catalog")).toBe(true);

    const templates = await client.listResourceTemplates();
    expect(templates.resourceTemplates.some((template) => template.uriTemplate === "belgium://domain/{domain}")).toBe(
      true
    );

    const domainSheet = await client.readResource({ uri: "belgium://domain/irail" });
    expect((domainSheet.contents[0] as { text: string }).text).toContain("irail_get_connections");

    const prompt = await client.getPrompt({
      name: "belgium_capability_guide",
      arguments: { task: "train from Brussels to Ghent" },
    });
    const promptText = prompt.messages
      .map((message) => ("text" in message.content ? message.content.text : ""))
      .join("\n");

    expect(promptText).toContain("irail");
    expect(promptText).toContain("irail_get_connections");
  });
});
