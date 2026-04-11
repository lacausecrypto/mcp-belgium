import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { dataGovBeClient } from "../client.js";

export function registerGetResourceTool(server: McpServer): void {
  server.tool(
    "datagov_get_resource",
    "Get the download URL and metadata for a specific Belgian federal CKAN resource.",
    {
      resourceId: z.string().describe("CKAN resource ID"),
    },
    async ({ resourceId }) => {
      try {
        return jsonResult(await dataGovBeClient.getResource(resourceId));
      } catch (e) {
        return errorResult(`Resource lookup failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
