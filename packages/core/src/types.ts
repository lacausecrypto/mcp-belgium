import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Every server module must export a function matching this signature.
 * It receives a McpServer instance and registers tools/resources/prompts on it.
 */
export type ServerRegistrar = (server: McpServer) => void;

/**
 * Standard MCP tool response content.
 */
export interface ToolTextResponse {
  [key: string]: unknown;
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

export function textResult(text: string): ToolTextResponse {
  return { content: [{ type: "text", text }] };
}

export function errorResult(message: string): ToolTextResponse {
  return { content: [{ type: "text", text: message }], isError: true };
}

export function jsonResult(data: unknown): ToolTextResponse {
  return textResult(JSON.stringify(data, null, 2));
}
