import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGetBelaqiTool } from "./tools/get-belaqi.js";
import { registerGetCurrentTool } from "./tools/get-current.js";
import { registerGetTimeseriesTool } from "./tools/get-timeseries.js";
import { registerSearchStationsTool } from "./tools/search-stations.js";

export function registerAll(server: McpServer): void {
  registerGetCurrentTool(server);
  registerSearchStationsTool(server);
  registerGetBelaqiTool(server);
  registerGetTimeseriesTool(server);
}
