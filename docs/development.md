# Development

## Requirements

- Node.js >= 22
- pnpm >= 9

## Setup

```bash
pnpm install
pnpm run build
pnpm run test
pnpm run typecheck
```

## Workspace layout

- `packages/core`: shared runtime and MCP helpers
- `packages/mcp-belgium`: public aggregated server
- `packages/mcp-*`: domain packages

## Contribution rule of thumb

If a change affects end users, update both:

- the relevant domain package
- the aggregated catalog and public docs
