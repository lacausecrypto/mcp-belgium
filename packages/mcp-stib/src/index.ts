#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createLogger, getPort } from "@belgium-gov-mcp/core";
import { registerAll } from "./register.js";

const logger = createLogger("mcp-stib");
const transport = process.env.MCP_TRANSPORT ?? "stdio";

function createServer(): McpServer {
  const server = new McpServer(
    {
      name: "belgium-gov-mcp-stib",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    }
  );

  registerAll(server);
  return server;
}

async function main() {
  if (transport === "stdio") {
    logger.info("Starting in stdio mode");
    const server = createServer();
    const stdioTransport = new StdioServerTransport();
    await server.connect(stdioTransport);
    return;
  }

  const port = getPort("PORT_STIB", 3004);
  const app = createMcpExpressApp({ host: "0.0.0.0" });

  app.post("/mcp", async (req, res) => {
    const server = createServer();
    const httpTransport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

    res.on("close", () => {
      void httpTransport.close();
      void server.close();
    });

    try {
      await server.connect(httpTransport);
      await httpTransport.handleRequest(req, res, req.body);
    } catch (err) {
      logger.error(err, "HTTP transport error");
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    }
  });

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", server: "mcp-stib", timestamp: new Date().toISOString() });
  });

  app.listen(port, "0.0.0.0", () => {
    logger.info(`MCP server mcp-stib listening on http://0.0.0.0:${port}/mcp`);
  });
}

main().catch((err) => {
  logger.error(err, "Fatal error");
  process.exit(1);
});
