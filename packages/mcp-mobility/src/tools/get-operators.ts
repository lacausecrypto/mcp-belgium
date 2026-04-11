import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { mobilityClient } from "../client.js";

export function registerGetOperatorsTool(server: McpServer): void {
  server.tool(
    "mobility_get_operators",
    "List Belgian public transport operators participating in the mobility ecosystem.",
    {},
    async () => {
      try {
        return jsonResult(await mobilityClient.getOperators());
      } catch (e) {
        return errorResult(`Operators lookup failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
