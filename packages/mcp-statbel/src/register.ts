import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGetCpiTool } from "./tools/get-cpi.js";
import { registerGetEmploymentTool } from "./tools/get-employment.js";
import { registerGetPopulationTool } from "./tools/get-population.js";
import { registerSearchDatasetsTool } from "./tools/search-datasets.js";

export function registerAll(server: McpServer): void {
  registerSearchDatasetsTool(server);
  registerGetPopulationTool(server);
  registerGetCpiTool(server);
  registerGetEmploymentTool(server);
}
