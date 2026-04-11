import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { airQualityClient } from "../client.js";

export function registerGetTimeseriesTool(server: McpServer): void {
  server.tool(
    "airquality_get_timeseries",
    "Get historical measurements for a specific air quality timeseries.",
    {
      timeseriesId: z.number().describe("Timeseries ID"),
      from: z.string().describe("ISO date"),
      to: z.string().describe("ISO date"),
    },
    async ({ timeseriesId, from, to }) => {
      try {
        return jsonResult(await airQualityClient.getTimeseriesData(timeseriesId, from, to));
      } catch (e) {
        return errorResult(`Timeseries fetch failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
