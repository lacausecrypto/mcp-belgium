import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { mobilityClient } from "../client.js";

export function registerGetGtfsFeedsTool(server: McpServer): void {
  server.tool(
    "mobility_get_gtfs_feeds",
    "List GTFS static and GTFS-RT feed sources relevant to Belgian mobility planning.",
    {},
    async () => {
      try {
        return jsonResult(await mobilityClient.getGtfsFeeds());
      } catch (e) {
        return errorResult(`GTFS feed lookup failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
