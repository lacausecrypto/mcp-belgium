import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { listDomainCatalog } from "../catalog.js";

export function registerBelgiumListDomainsTool(server: McpServer): void {
  server.tool(
    "belgium_list_domains",
    "List the Belgian domains aggregated by this server, optionally filtered by topic or restricted to domains that are live and require no API key.",
    {
      query: z
        .string()
        .optional()
        .describe("Optional keyword filter across domain names, summaries, available data, use cases, notes, and tool names"),
      onlyPublicNoKey: z
        .boolean()
        .default(false)
        .describe("If true, only return domains that are live and do not require an API key"),
      includeTools: z
        .boolean()
        .default(true)
        .describe("If true, include the exact tool names exposed by each returned domain"),
    },
    async ({ query, onlyPublicNoKey, includeTools }) => {
      try {
        return jsonResult(listDomainCatalog({ query, onlyPublicNoKey, includeTools }));
      } catch (e) {
        return errorResult(`Belgium domain listing failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
