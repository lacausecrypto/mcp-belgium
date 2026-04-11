import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { airQualityClient } from "../client.js";

export function registerSearchStationsTool(server: McpServer): void {
  server.tool(
    "airquality_search_stations",
    "Search air quality monitoring stations near a location.",
    {
      latitude: z.number().describe("Latitude"),
      longitude: z.number().describe("Longitude"),
      radius: z.number().default(10000).describe("Radius in meters"),
    },
    async ({ latitude, longitude, radius }) => {
      try {
        return jsonResult(await airQualityClient.searchStations(latitude, longitude, radius));
      } catch (e) {
        return errorResult(`Station search failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
