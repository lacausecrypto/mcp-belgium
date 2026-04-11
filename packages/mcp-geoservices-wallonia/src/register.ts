import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGetServiceTool } from "./tools/get-service.js";
import { registerListFoldersTool } from "./tools/list-folders.js";
import { registerListServicesTool } from "./tools/list-services.js";
import { registerQueryLayerTool } from "./tools/query-layer.js";

export function registerAll(server: McpServer): void {
  registerListFoldersTool(server);
  registerListServicesTool(server);
  registerGetServiceTool(server);
  registerQueryLayerTool(server);
}
