import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGetDatasetTool } from "./tools/get-dataset.js";
import { registerGetRecordsTool } from "./tools/get-records.js";
import { registerSearchDatasetsTool } from "./tools/search-datasets.js";

export function registerAll(server: McpServer): void {
  registerSearchDatasetsTool(server);
  registerGetDatasetTool(server);
  registerGetRecordsTool(server);
}
