import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerDescribeFeatureTypeTool } from "./tools/describe-feature-type.js";
import { registerGetFeaturesTool } from "./tools/get-features.js";
import { registerGetMunicipalitiesBoundariesTool } from "./tools/get-municipalities-boundaries.js";
import { registerListFeatureTypesTool } from "./tools/list-feature-types.js";

export function registerAll(server: McpServer): void {
  registerListFeatureTypesTool(server);
  registerDescribeFeatureTypeTool(server);
  registerGetFeaturesTool(server);
  registerGetMunicipalitiesBoundariesTool(server);
}
