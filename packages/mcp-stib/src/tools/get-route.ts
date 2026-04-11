import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { stibClient } from "../client.js";

export function registerGetRouteTool(server: McpServer): void {
  server.tool(
    "stib_get_route",
    "Get details for a STIB metro, tram, or bus line.",
    {
      lineId: z.string().describe("Line number, e.g. 1, 81, 71"),
    },
    async ({ lineId }) => {
      try {
        return jsonResult(await stibClient.getRoute(lineId));
      } catch (e) {
        return errorResult(`Route lookup failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
