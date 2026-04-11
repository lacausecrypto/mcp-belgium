import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { getCatalogOverview } from "../catalog.js";

export function registerBelgiumCatalogOverviewTool(server: McpServer): void {
  server.tool(
    "belgium_catalog_overview",
    "Get a structured overview of all Belgian domains aggregated by this server, including status, categories, resources, and recommended starting points.",
    {},
    async () => {
      try {
        return jsonResult(getCatalogOverview());
      } catch (e) {
        return errorResult(`Belgium catalog overview failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
