import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { irailClient } from "../client.js";

export function registerGetVehicleTool(server: McpServer): void {
  server.tool(
    "irail_get_vehicle",
    "Get detailed stop information for a specific Belgian train. Shows all stops, arrival/departure times, delays, and platforms.",
    { vehicleId: z.string().describe("Vehicle ID, e.g. BE.NMBS.IC1832") },
    async ({ vehicleId }) => {
      try {
        return jsonResult(await irailClient.getVehicle(vehicleId));
      } catch (e) {
        return errorResult(`Vehicle fetch failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
