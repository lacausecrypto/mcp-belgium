import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { kmiClient } from "../client.js";

export function registerDescribeFeatureTypeTool(server: McpServer): void {
  server.tool(
    "kmi_describe_feature_type",
    "Describe the schema of a KMI/IRM WFS feature type.",
    {
      typeName: z.string().describe("Exact WFS feature type name, e.g. aws:aws_station"),
    },
    async ({ typeName }) => {
      try {
        return jsonResult(await kmiClient.describeFeatureType(typeName));
      } catch (e) {
        return errorResult(`Feature type description failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
