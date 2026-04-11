import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerBuildMapUrlTool } from "./tools/build-map-url.js";
import { registerGetLayerTool } from "./tools/get-layer.js";
import { registerListLayersTool } from "./tools/list-layers.js";

export function registerAll(server: McpServer): void {
  registerListLayersTool(server);
  registerGetLayerTool(server);
  registerBuildMapUrlTool(server);
}
