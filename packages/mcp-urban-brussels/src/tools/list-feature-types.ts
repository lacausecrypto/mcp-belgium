import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { urbanBrusselsClient } from "../client.js";

export function registerListFeatureTypesTool(server: McpServer): void {
  server.tool(
    "urban_list_feature_types",
    "List public urban.brussels WFS feature types.",
    {
      query: z.string().optional().describe("Optional text filter on feature type name or title"),
      limit: z.number().min(1).max(100).default(25).describe("Maximum number of feature types to return"),
    },
    async ({ query, limit }) => {
      try {
        return jsonResult(await urbanBrusselsClient.listFeatureTypes(query, limit));
      } catch (e) {
        return errorResult(`Feature type listing failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
