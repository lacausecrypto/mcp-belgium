import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGetDatasetTool } from "./tools/get-dataset.js";
import { registerListOrganizationsTool } from "./tools/list-organizations.js";
import { registerSearchDatasetsTool } from "./tools/search-datasets.js";

export function registerAll(server: McpServer): void {
  registerSearchDatasetsTool(server);
  registerGetDatasetTool(server);
  registerListOrganizationsTool(server);
}
