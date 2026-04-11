import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { walloniaGeoClient } from "../client.js";

export function registerListFoldersTool(server: McpServer): void {
  server.tool(
    "wallonia_geo_list_folders",
    "List top-level folders published by Wallonia GeoServices.",
    {},
    async () => {
      try {
        return jsonResult(await walloniaGeoClient.listFolders());
      } catch (e) {
        return errorResult(`Folder listing failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
