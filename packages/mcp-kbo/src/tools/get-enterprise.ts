import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { kboClient } from "../client.js";

export function registerGetEnterpriseTool(server: McpServer): void {
  server.tool(
    "kbo_get_enterprise",
    "Get full details for a Belgian enterprise by BCE number.",
    {
      enterpriseNumber: z.string().describe("BCE number, e.g. 0123.456.789"),
    },
    async ({ enterpriseNumber }) => {
      try {
        return jsonResult(await kboClient.getEnterprise(enterpriseNumber));
      } catch (e) {
        return errorResult(`Enterprise lookup failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
