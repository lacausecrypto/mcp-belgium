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

describe("mcp-belgium deprecation handling", () => {
  it("hides deprecated domains from belgium_list_domains by default", async () => {
    const { client } = await createConnectedPair();

    const result = await client.callTool({
      name: "belgium_list_domains",
      arguments: {},
    });
    expect(result.isError).toBeFalsy();

    const payload = JSON.parse((result.content[0] as { text: string }).text) as {
      includeDeprecated: boolean;
      domains: { id: string; status: string }[];
    };

    expect(payload.includeDeprecated).toBe(false);
    const ids = payload.domains.map((d) => d.id);
    expect(ids).not.toContain("data-gov-be");
    expect(ids).not.toContain("flanders");
    expect(payload.domains.every((d) => d.status !== "deprecated")).toBe(true);
  });

  it("surfaces deprecated domains when includeDeprecated=true and marks their status", async () => {
    const { client } = await createConnectedPair();

    const result = await client.callTool({
      name: "belgium_list_domains",
      arguments: { includeDeprecated: true },
    });
    expect(result.isError).toBeFalsy();

    const payload = JSON.parse((result.content[0] as { text: string }).text) as {
      includeDeprecated: boolean;
      domains: { id: string; status: string }[];
    };

    expect(payload.includeDeprecated).toBe(true);
    const deprecated = payload.domains.filter((d) => d.status === "deprecated").map((d) => d.id);
    expect(deprecated).toEqual(expect.arrayContaining(["data-gov-be", "flanders"]));
  });

  it("reports deprecated domains in the catalog overview status buckets", async () => {
    const { client } = await createConnectedPair();

    const overview = await client.readResource({ uri: "belgium://catalog.json" });
    const text = (overview.contents[0] as { text: string }).text;
    const parsed = JSON.parse(text) as {
      domainsByStatus: { deprecated: string[] };
    };

    expect(parsed.domainsByStatus.deprecated).toEqual(
      expect.arrayContaining(["data-gov-be", "flanders"])
    );
  });

  it("flags deprecation in the per-domain markdown resource", async () => {
    const { client } = await createConnectedPair();

    const sheet = await client.readResource({ uri: "belgium://domain/flanders" });
    const text = (sheet.contents[0] as { text: string }).text;

    expect(text).toMatch(/DEPRECATED/);
    expect(text).toContain("Status: `deprecated`");
  });

  it("returns a clear upstream-unavailable error for deprecated-domain tools", async () => {
    const { client } = await createConnectedPair();

    const result = await client.callTool({
      name: "flanders_search_datasets",
      arguments: { query: "irrelevant" },
    });

    const text = (result.content[0] as { text: string }).text;
    // Tool must be callable (still registered) but return a human-readable
    // deprecation message, not a silent empty result.
    expect(text.toLowerCase()).toMatch(/api key|no longer|unavailable|datavindplaats/);
  });

  it("does not suggest deprecated domains from the capability guide", async () => {
    const { client } = await createConnectedPair();

    const prompt = await client.getPrompt({
      name: "belgium_capability_guide",
      arguments: { task: "Flemish open data search" },
    });
    const promptText = prompt.messages
      .map((m) => ("text" in m.content ? m.content.text : ""))
      .join("\n");

    // Even when the task keyword strongly matches the deprecated Flanders
    // domain, the suggestions list must not point users toward a retired API.
    const suggestionsBlock = promptText.split("Recommended domains and tools:")[1] ?? "";
    expect(suggestionsBlock).not.toMatch(/^- flanders: /m);
    expect(suggestionsBlock).not.toMatch(/^- data-gov-be: /m);
  });
});
