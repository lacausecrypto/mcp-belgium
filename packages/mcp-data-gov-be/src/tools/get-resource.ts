import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { dataGovBeClient } from "../client.js";
import { languageSchema } from "./language.js";

export function registerGetResourceTool(server: McpServer): void {
  server.tool(
    "datagov_get_resource",
    "Get the download URL, format and license of a single data.gov.be resource (distribution).",
    {
      resourceId: z.string().min(1).describe("Resource id from the `resources` list of datagov_get_dataset"),
      language: languageSchema,
    },
    async ({ resourceId, language }) => {
      try {
        return jsonResult(await dataGovBeClient.getResource(resourceId, language));
      } catch (e) {
        return errorResult(`Resource lookup failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
