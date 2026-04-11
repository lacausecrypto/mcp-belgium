import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { airQualityClient } from "../client.js";

export function registerGetBelaqiTool(server: McpServer): void {
  server.tool(
    "airquality_get_belaqi",
    "Get the BelAQI air quality index for a location by using the nearest monitoring station.",
    {
      latitude: z.number().describe("Latitude"),
      longitude: z.number().describe("Longitude"),
    },
    async ({ latitude, longitude }) => {
      try {
        return jsonResult(await airQualityClient.getBelaqi(latitude, longitude));
      } catch (e) {
        return errorResult(`BelAQI fetch failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
