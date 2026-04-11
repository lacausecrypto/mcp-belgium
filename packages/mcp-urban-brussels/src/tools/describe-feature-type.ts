import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { urbanBrusselsClient } from "../client.js";

export function registerDescribeFeatureTypeTool(server: McpServer): void {
  server.tool(
    "urban_describe_feature_type",
    "Describe the schema of an urban.brussels WFS feature type.",
    {
      typeName: z.string().describe("Exact WFS feature type name"),
    },
    async ({ typeName }) => {
      try {
        return jsonResult(await urbanBrusselsClient.describeFeatureType(typeName));
      } catch (e) {
        return errorResult(`Feature type description failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
