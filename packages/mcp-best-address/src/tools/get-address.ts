import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { bestAddressClient } from "../client.js";

export function registerGetAddressTool(server: McpServer): void {
  server.tool(
    "best_get_address",
    "Get a single Belgian address object by its BeST identifier URI.",
    {
      id: z.string().describe("BeST address identifier URI"),
    },
    async ({ id }) => {
      try {
        return jsonResult(await bestAddressClient.getAddress(id));
      } catch (e) {
        return errorResult(`Address fetch failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
