import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { kmiClient } from "../client.js";

export function registerGetFeaturesTool(server: McpServer): void {
  server.tool(
    "kmi_get_features",
    "Fetch GeoJSON features from a KMI/IRM WFS layer.",
    {
      typeName: z.string().describe("Exact WFS feature type name, e.g. aws:aws_1hour"),
      count: z.number().min(1).max(500).default(10).describe("Maximum number of features to return"),
      cqlFilter: z.string().optional().describe("Optional GeoServer CQL filter"),
      bbox: z.string().optional().describe("Optional bounding box as minX,minY,maxX,maxY"),
    },
    async ({ typeName, count, cqlFilter, bbox }) => {
      try {
        return jsonResult(await kmiClient.getFeatures(typeName, count, cqlFilter, bbox));
      } catch (e) {
        return errorResult(`Feature fetch failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
