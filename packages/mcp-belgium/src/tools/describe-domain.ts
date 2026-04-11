import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { describeDomain, DOMAIN_IDS } from "../catalog.js";

export function registerBelgiumDescribeDomainTool(server: McpServer): void {
  server.tool(
    "belgium_describe_domain",
    "Get the precise summary, tool list, upstream, authentication status, caveats, and data coverage for one Belgian domain aggregated by this server.",
    {
      domain: z.enum(DOMAIN_IDS).describe("Exact Belgium domain identifier, for example irail, statbel, best-address, or urban-brussels"),
    },
    async ({ domain }) => {
      try {
        return jsonResult(describeDomain(domain));
      } catch (e) {
        return errorResult(`Belgium domain description failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
