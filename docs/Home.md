# mcp-belgium Docs

This directory is the public documentation hub for `mcp-belgium`.

Use it as the repository wiki index:

- [Installation](./installation.md)
- [Client configuration](./client-config.md)
- [Domain catalog](./domains.md)
- [Development](./development.md)
- [Release and npm publishing](./release.md)

## What this project is

`mcp-belgium` is a single MCP server that aggregates Belgian public APIs behind one installable package and one MCP config entry.

It is designed so that:

- end users install only `mcp-belgium`
- the LLM can self-discover the right Belgian domain through built-in catalog tools and resources
- internal packages stay modular for maintenance, testing, and publishing

## Quick start

```bash
npx -y mcp-belgium
```

Then point your MCP client to the package as shown in [client configuration](./client-config.md).
