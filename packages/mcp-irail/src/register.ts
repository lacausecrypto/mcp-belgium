import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGetConnectionsTool } from "./tools/get-connections.js";
import { registerGetDisturbancesTool } from "./tools/get-disturbances.js";
import { registerGetLiveboardTool } from "./tools/get-liveboard.js";
import { registerGetVehicleTool } from "./tools/get-vehicle.js";
import { registerSearchStationsTool } from "./tools/search-stations.js";

export function registerAll(server: McpServer): void {
  registerSearchStationsTool(server);
  registerGetConnectionsTool(server);
  registerGetLiveboardTool(server);
  registerGetVehicleTool(server);
  registerGetDisturbancesTool(server);
}
