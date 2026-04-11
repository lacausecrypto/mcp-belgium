# Installation

## npm

Run without cloning:

```bash
npx -y mcp-belgium
```

Or with pnpm:

```bash
pnpm dlx mcp-belgium
```

Global install:

```bash
pnpm add -g mcp-belgium
```

## Runtime modes

- `stdio`: default, recommended for desktop MCP clients
- `http`: Streamable HTTP transport for remote or containerized use

## Optional environment variables

- `STIB_API_KEY`
- `CBEAPI_KEY`
- `MCP_TRANSPORT`
- `PORT_BELGIUM`
- `LOG_LEVEL`
