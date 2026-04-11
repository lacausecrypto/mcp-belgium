import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { airQualityClient } from "../client.js";

export function registerGetCurrentTool(server: McpServer): void {
  server.tool(
    "airquality_get_current",
    "Get latest air quality measurements for a monitoring station.",
    {
      stationId: z.number().describe("Station ID"),
    },
    async ({ stationId }) => {
      try {
        return jsonResult(await airQualityClient.getCurrent(stationId));
      } catch (e) {
        return errorResult(`Current measurements fetch failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
