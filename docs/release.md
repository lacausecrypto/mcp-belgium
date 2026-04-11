# Release and npm Publishing

## Public package

The main end-user package is:

```bash
mcp-belgium
```

## Internal packages

The aggregated package depends on internal published packages under the `@lacausecrypto/*` scope.

That means a release normally publishes the full workspace, not only the top-level package.

## Publish

```bash
npm login
pnpm -r publish --access public --no-git-checks
```

## Recommended release checks

```bash
pnpm run build
pnpm run test
pnpm run typecheck
pnpm audit --prod
```
