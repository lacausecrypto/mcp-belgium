import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { stibClient } from "../client.js";

export function registerGetMessagesTool(server: McpServer): void {
  server.tool(
    "stib_get_messages",
    "Get current STIB service messages and disruptions.",
    {},
    async () => {
      try {
        return jsonResult(await stibClient.getMessages());
      } catch (e) {
        return errorResult(`Service messages fetch failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
