import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { dataGovBeClient } from "../client.js";

export function registerListOrganizationsTool(server: McpServer): void {
  server.tool(
    "datagov_list_organizations",
    "List publishers in the data.gov.be catalogue, ordered by number of datasets. Names can be passed as `organization` to datagov_search_datasets.",
    {
      limit: z.number().int().min(1).max(250).default(25).describe("Maximum number of organizations to return"),
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
