import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { mobilityClient } from "../client.js";

export function registerPlanTripTool(server: McpServer): void {
  server.tool(
    "mobility_plan_trip",
    "Plan a door-to-door public transport trip in Belgium across SNCB, STIB, De Lijn and TEC (via Transitous). Times are Brussels local time.",
    {
      from: z.string().min(1).describe("Origin: station, stop, address or 'lat,lon'"),
      to: z.string().min(1).describe("Destination: station, stop, address or 'lat,lon'"),
      datetime: z
        .string()
        .optional()
        .describe("Brussels local time, e.g. 2026-04-11T14:30 (defaults to now)"),
      arriveBy: z.boolean().default(false).describe("Treat datetime as the latest arrival time instead of departure"),
    },
    async ({ from, to, datetime, arriveBy }) => {
      try {
        return jsonResult(await mobilityClient.planTrip(from, to, datetime, arriveBy));
      } catch (e) {
        return errorResult(`Trip planning failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
