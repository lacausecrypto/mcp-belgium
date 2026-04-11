# Release and npm Publishing

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

## Recommended release checks

```bash
pnpm run build
pnpm run test
pnpm run typecheck
pnpm audit --prod
```
