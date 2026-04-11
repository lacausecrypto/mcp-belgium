# mcp-belgium

[![npm version](https://img.shields.io/npm/v/mcp-belgium?style=flat&logo=npm)](https://www.npmjs.com/package/mcp-belgium)
[![npm downloads](https://img.shields.io/npm/dt/mcp-belgium?style=flat&logo=npm)](https://www.npmjs.com/package/mcp-belgium)
[![CI](https://img.shields.io/github/actions/workflow/status/lacausecrypto/mcp-belgium/ci.yml?branch=main&style=flat&label=ci)](https://github.com/lacausecrypto/mcp-belgium/actions/workflows/ci.yml)
[![license](https://img.shields.io/github/license/lacausecrypto/mcp-belgium?style=flat)](https://github.com/lacausecrypto/mcp-belgium/blob/main/LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D22-43853d?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9-F69220?style=flat&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![typescript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![mcp](https://img.shields.io/badge/MCP-stdio%20%2B%20Streamable%20HTTP-111827?style=flat)](https://modelcontextprotocol.io/)

Single MCP server for Belgian public APIs.

`mcp-belgium` aggregates Belgian transport, statistics, open data, address, air quality, weather, and geospatial tools behind one install and one MCP client entry.

## Install

```bash
npx -y mcp-belgium
```

Or:

```bash
pnpm dlx mcp-belgium
```

## Claude Desktop

```json
{
  "mcpServers": {
    "belgium": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-belgium"
      ],
      "env": {
        "LOG_LEVEL": "silent"
      }
    }
  }
}
```

## Docs

- GitHub: [lacausecrypto/mcp-belgium](https://github.com/lacausecrypto/mcp-belgium)
- Docs index: [docs/Home.md](https://github.com/lacausecrypto/mcp-belgium/blob/main/docs/Home.md)
