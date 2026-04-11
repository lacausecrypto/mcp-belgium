# Client Configuration

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

## Why one server

The project deliberately exposes one aggregated MCP server so clients do not need a long list of Belgian sub-servers.

The LLM can still route correctly because the server includes:

- catalog tools
- catalog resources
- a capability guide prompt
- namespaced tool families per domain
