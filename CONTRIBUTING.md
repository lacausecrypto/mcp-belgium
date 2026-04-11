# Contributing

## Development

Requirements:

- Node.js 22+
- pnpm 9+

Setup:

```bash
pnpm install
pnpm run build
pnpm run test
pnpm run typecheck
```

## Project Shape

- `packages/core`: shared HTTP, retry, cache, rate limiting, XML helpers, and MCP response helpers
- `packages/mcp-*`: one package per Belgian API domain
- `packages/mcp-belgium`: aggregated single-server entry point and primary public npm package

## Public Package Focus

The main consumer-facing package is:

- `mcp-belgium`

Documentation changes should treat that package as the default install path unless a change is specifically about local development or one domain package.

## Contribution Rules

- Keep tool names stable once published
- Route all upstream HTTP through `@lacausecrypto/core`
- Use `.js` extensions in local ESM imports
- Add or update tests when changing shared behavior or a server contract
- Prefer explicit upstream limitation messages over silent failures when an API changes
- Keep the root `README.md` consumer-first and npm-first

## Documentation Expectations

- Prefer `npx -y mcp-belgium` or `pnpm dlx mcp-belgium` in public-facing examples
- Treat all `@lacausecrypto/*` packages except `mcp-belgium` as internal workspace packages, not end-user install targets
- Do not commit machine-specific paths in public docs
- When changing domain status, update the aggregated catalog and the README domain table together

## Validation Before Opening A PR

```bash
pnpm run build
pnpm run test
pnpm run typecheck
```
