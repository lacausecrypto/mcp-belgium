# mcp-belgium

[![npm version](https://img.shields.io/npm/v/mcp-belgium?style=flat&logo=npm)](https://www.npmjs.com/package/mcp-belgium)
[![npm downloads](https://img.shields.io/npm/dt/mcp-belgium?style=flat&logo=npm)](https://www.npmjs.com/package/mcp-belgium)
[![CI](https://img.shields.io/github/actions/workflow/status/lacausecrypto/mcp-belgium/ci.yml?branch=main&style=flat&label=ci)](https://github.com/lacausecrypto/mcp-belgium/actions/workflows/ci.yml)
[![license](https://img.shields.io/github/license/lacausecrypto/mcp-belgium?style=flat)](./LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D22-43853d?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9-F69220?style=flat&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![typescript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![mcp](https://img.shields.io/badge/MCP-stdio%20%2B%20Streamable%20HTTP-111827?style=flat)](https://modelcontextprotocol.io/)

One MCP server for Belgian public APIs.

`mcp-belgium` is the public entry point. It exposes a single aggregated MCP server that bundles Belgian transport, official statistics, open data, addresses, weather, air quality, and geospatial services behind one install and one client config entry.

## Why use it

- one npm package
- one MCP server entry in your client config
- namespaced tools like `irail_*`, `statbel_*`, `best_*`, `kmi_*`, `urban_*`, and `urbis_*`
- built-in catalog tools, resources, and a prompt so the LLM can discover the right Belgian domain before calling tools
- explicit limitation surfaces when an upstream requires a key or has changed contract

## Install

Run directly:

```bash
npx -y mcp-belgium
```

With pnpm:

```bash
pnpm dlx mcp-belgium
```

Global install:

```bash
pnpm add -g mcp-belgium
mcp-belgium
```

Default transport is `stdio`, which is what desktop MCP clients expect.

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

Optional env vars:

- `STIB_API_KEY`: enables live STIB/MIVB tools
- `CBEAPI_KEY`: enables live KBO/BCE company registry tools
- `MCP_TRANSPORT=http`: runs the server over Streamable HTTP
- `PORT_BELGIUM=3017`: sets the HTTP port for the aggregated server

## What the LLM gets

Alongside the domain tools, `mcp-belgium` exposes a discovery layer:

- `belgium_catalog_overview`
- `belgium_list_domains`
- `belgium_describe_domain`
- `belgium://catalog`
- `belgium://catalog.json`
- `belgium://domain/{domain}`
- `belgium_capability_guide`

That means the LLM can:

- inspect the Belgian domains available from this single MCP
- see which domains are live, limited, or key-gated
- understand what kind of data each domain provides
- pick the right namespaced tool without guessing

## Main domains

| Prefix | Domain | Status | Auth | Main data |
| --- | --- | --- | --- | --- |
| `irail_*` | Belgian rail / iRail | Live | None | stations, connections, liveboards, vehicles, disruptions |
| `mobility_*` | Belgian mobility / SMOP | Live | None | intermodal trip planning, operators, GTFS references |
| `stib_*` | STIB/MIVB Brussels transit | Live | API key | waiting times, stops, routes, service messages |
| `infrabel_*` | Infrabel Open Data | Live | None | rail infrastructure datasets and records |
| `kbo_*` | Belgian company registry | Live | API key | enterprise search and company details |
| `best_*` | BeST Belgian addresses | Live | None | addresses, municipalities, streets, postal infos |
| `statbel_*` | Statbel | Live | None | population, CPI, employment, dataset search |
| `airquality_*` | IRCELINE air quality | Live | None | stations, live measurements, BelAQI, timeseries |
| `brussels_*` | Brussels Region open data | Live | None | datasets and records |
| `wallonia_*` | Wallonia open data | Live | None | datasets and records |
| `kmi_*` | KMI / IRM GeoServer | Live | None | stations, hourly observations, WFS discovery |
| `wallonia_geo_*` | Wallonia GeoServices | Live | None | ArcGIS folders, services, layer queries |
| `urban_*` | urban.brussels WFS | Live | None | feature types, schemas, GeoJSON features |
| `urbis_*` | URBIS public WMS | Live | None | WMS layer discovery and map URL generation |
| `datagov_*` | data.gov.be compatibility layer | Limited | None | explicit upstream-changed error surface |
| `flanders_*` | Datavindplaats compatibility layer | Limited | API key | explicit upstream limitation surface |

## Docs / Wiki

The repo now includes a `docs/` tree that works as a lightweight public wiki:

- [Docs home](./docs/Home.md)
- [Installation](./docs/installation.md)
- [Client configuration](./docs/client-config.md)
- [Domain catalog](./docs/domains.md)
- [Development](./docs/development.md)
- [Release and npm publishing](./docs/release.md)

## Local development

Requirements:

- Node.js >= 22
- pnpm >= 9

Setup:

```bash
pnpm install
pnpm run build
pnpm run test
pnpm run typecheck
```

Run the aggregated server over stdio:

```bash
pnpm --filter mcp-belgium start:stdio
```

Run it over Streamable HTTP:

```bash
MCP_TRANSPORT=http PORT_BELGIUM=3017 pnpm --filter mcp-belgium start
```

Run the whole workspace:

```bash
docker compose up --build
```

## Monorepo shape

- `packages/core`: shared HTTP, retry, cache, rate limiting, XML helpers, and MCP response helpers
- `packages/mcp-belgium`: public aggregated entry point
- `packages/mcp-*`: domain-specific packages kept modular for maintenance, testing, and isolated validation

The public consumer path is `mcp-belgium`. Internal workspace packages stay modular for development, but the published `mcp-belgium` package bundles them so end users install only one npm package.

## Upstream caveats

This project wraps public upstream APIs. Some Belgian portals change authentication or endpoint contracts over time. When an upstream is no longer publicly compatible, this project prefers explicit, machine-readable limitation errors over silent failure.

Current examples:

- `mcp-stib` requires `STIB_API_KEY`
- `mcp-kbo` requires `CBEAPI_KEY`
- `mcp-data-gov-be` preserves the old tool contract but returns an explicit upstream-changed error
- `mcp-opendata-flanders` preserves the old tool contract but returns an explicit API-key limitation

## Validation

Current workspace checks:

- `pnpm run build`
- `pnpm run test`
- `pnpm run typecheck`
- `pnpm audit --prod`

## License

MIT. See [LICENSE](./LICENSE).
