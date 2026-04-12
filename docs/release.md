# Release, npm, and MCP Registry Publishing

## Public package

The main end-user package is:

```bash
mcp-belgium
```

## Internal packages

The public npm package is only:

```bash
mcp-belgium
```

Internal `@lacausecrypto/*` packages are workspace-only and are bundled into the published artifact.

## Publish

```bash
npm login
pnpm --filter mcp-belgium publish --access public --no-git-checks
```

## Publish to the MCP Registry

`mcp-belgium` is configured for the official MCP Registry with:

- `mcpName` in `packages/mcp-belgium/package.json`
- `packages/mcp-belgium/server.json`
- GitHub Actions workflow `.github/workflows/publish-mcp-registry.yml`

Release flow:

```bash
pnpm run build
pnpm run test
pnpm run typecheck
pnpm --filter mcp-belgium publish --access public --no-git-checks
git tag v1.0.3
git push origin main
git push origin v1.0.3
```

The tag push publishes metadata to the MCP Registry through GitHub OIDC. npm publication stays manual by design.

## Recommended release checks

```bash
pnpm run build
pnpm run test
pnpm run typecheck
pnpm audit --prod
```
