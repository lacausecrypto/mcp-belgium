import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGetEnterpriseTool } from "./tools/get-enterprise.js";
import { registerSearchByActivityTool } from "./tools/search-by-activity.js";
import { registerSearchEnterpriseTool } from "./tools/search-enterprise.js";

export function registerAll(server: McpServer): void {
  registerSearchEnterpriseTool(server);
  registerGetEnterpriseTool(server);
  registerSearchByActivityTool(server);
}
