# mcp-belgium

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
