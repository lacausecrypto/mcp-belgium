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

## API keys

Key-gated domains read their key from the server environment. Add them to the same `env` block:

```json
"env": {
  "LOG_LEVEL": "silent",
  "CBEAPI_KEY": "<your cbeapi key>",
  "STIB_API_KEY": "<your stib key>"
}
```

- `CBEAPI_KEY`: KBO/BCE company registry, free tier (2,500 calls/day) at https://cbeapi.be
- `STIB_API_KEY`: STIB/MIVB real-time Brussels transit

Restart the MCP client after editing its config.

## Why one server

The project deliberately exposes one aggregated MCP server so clients do not need a long list of Belgian sub-servers.

The LLM can still route correctly because the server includes:

- catalog tools
- catalog resources
- a capability guide prompt
- namespaced tool families per domain
