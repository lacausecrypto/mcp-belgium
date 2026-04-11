import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { bestAddressClient } from "../client.js";

export function registerSearchAddressesTool(server: McpServer): void {
  server.tool(
    "best_search_addresses",
    "Search Belgian addresses using the official BeST public address API.",
    {
      municipalityName: z.string().optional().describe("Municipality name, e.g. Bruxelles"),
      postCode: z.string().optional().describe("Belgian postal code"),
      streetName: z.string().optional().describe("Street name"),
      houseNumber: z.string().optional().describe("House number"),
      boxNumber: z.string().optional().describe("Optional box or apartment number"),
      xLong: z.number().optional().describe("Longitude or X coordinate"),
      yLat: z.number().optional().describe("Latitude or Y coordinate"),
      radius: z.number().min(1).max(1000).default(100).describe("Radius in meters when searching by coordinates"),
      crs: z.enum(["wgs84", "lam72", "lam08"]).optional().describe("Coordinate reference system"),
      limit: z.number().min(1).max(50).default(10).describe("Maximum number of addresses to return"),
      page: z.number().min(1).default(1).describe("Result page number"),
    },
    async (params) => {
      try {
        return jsonResult(await bestAddressClient.searchAddresses(params));
      } catch (e) {
        return errorResult(`Address search failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
