import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { dataGovBeClient } from "../client.js";

export function registerListOrganizationsTool(server: McpServer): void {
  server.tool(
    "datagov_list_organizations",
    "List Belgian public organizations publishing federal open data.",
    {
      limit: z.number().min(1).max(100).default(25).describe("Maximum number of organizations to return"),
    },
    async ({ limit }) => {
      try {
        return jsonResult(await dataGovBeClient.listOrganizations(limit));
      } catch (e) {
        return errorResult(`Organization listing failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
