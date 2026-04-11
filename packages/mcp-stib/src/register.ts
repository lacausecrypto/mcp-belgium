import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGetMessagesTool } from "./tools/get-messages.js";
import { registerGetRouteTool } from "./tools/get-route.js";
import { registerGetWaitingTimesTool } from "./tools/get-waiting-times.js";
import { registerSearchStopsTool } from "./tools/search-stops.js";

export function registerAll(server: McpServer): void {
  registerGetWaitingTimesTool(server);
  registerSearchStopsTool(server);
  registerGetRouteTool(server);
  registerGetMessagesTool(server);
}
