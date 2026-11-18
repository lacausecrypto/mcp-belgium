import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { airQualityClient } from "../client.js";

export function registerGetBelaqiTool(server: McpServer): void {
  server.tool(
    "airquality_get_belaqi",
    "Get the current BelAQI air quality index (1 excellent … 10 horrible) at a Belgian location, from the IRCELINE hourly interpolated map, plus the nearest monitoring station.",
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
