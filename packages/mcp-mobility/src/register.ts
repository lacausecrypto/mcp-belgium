import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGetGtfsFeedsTool } from "./tools/get-gtfs-feeds.js";
import { registerGetOperatorsTool } from "./tools/get-operators.js";
import { registerPlanTripTool } from "./tools/plan-trip.js";

export function registerAll(server: McpServer): void {
  registerPlanTripTool(server);
  registerGetOperatorsTool(server);
  registerGetGtfsFeedsTool(server);
}
