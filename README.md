# belgium-gov-mcp

[![npm version](https://img.shields.io/npm/v/%40belgium-gov-mcp%2Fbelgium?style=flat-square&logo=npm)](https://www.npmjs.com/package/@belgium-gov-mcp/belgium)
[![npm downloads](https://img.shields.io/npm/dt/%40belgium-gov-mcp%2Fbelgium?style=flat-square&logo=npm)](https://www.npmjs.com/package/@belgium-gov-mcp/belgium)
[![license](https://img.shields.io/badge/license-MIT-16a34a?style=flat-square)](./LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D22-43853d?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![typescript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![vitest](https://img.shields.io/badge/tests-vitest-729b1b?style=flat-square)](https://vitest.dev/)
[![mcp](https://img.shields.io/badge/MCP-stdio%20%2B%20Streamable%20HTTP-111827?style=flat-square)](https://modelcontextprotocol.io/)

Single-package MCP access to Belgian public data.

`@belgium-gov-mcp/belgium` is the recommended published package. It exposes one aggregated MCP server that bundles Belgian transport, statistics, open data, address, weather, air-quality, and geospatial domains behind a single configuration entry.

## Why This Exists

Most Belgian public data MCP integrations end up as a long list of separate servers in the client config. This project removes that friction:

- one published npm package
- one MCP server entry in the client config
- namespaced tools such as `irail_*`, `statbel_*`, `best_*`, `urban_*`, or `urbis_*`
- built-in catalog tools, resources, and a prompt so the LLM can discover the right domain before calling tools

## Install From npm

Run directly without cloning:

```bash
npx -y @belgium-gov-mcp/belgium
```

With pnpm:

```bash
pnpm dlx @belgium-gov-mcp/belgium
```

Install globally if you want a stable local binary:

```bash
pnpm add -g @belgium-gov-mcp/belgium
mcp-belgium
```

By default the server starts in `stdio` mode, which is what MCP desktop clients expect.

## Claude Desktop Example

```json
{
  "mcpServers": {
    "belgium": {
      "command": "npx",
      "args": [
        "-y",
        "@belgium-gov-mcp/belgium"
      ],
      "env": {
        "LOG_LEVEL": "silent"
      }
    }
  }
}
```

Optional environment variables:

- `STIB_API_KEY`: enables live STIB/MIVB tools
- `CBEAPI_KEY`: enables live KBO/BCE company registry tools
- `MCP_TRANSPORT=http`: runs the server over Streamable HTTP instead of stdio
- `PORT_BELGIUM=3017`: sets the HTTP port for the aggregated server

## What The LLM Gets

The aggregated server exposes the normal domain tools and an internal discovery layer:

- Tool: `belgium_catalog_overview`
- Tool: `belgium_list_domains`
- Tool: `belgium_describe_domain`
- Resource: `belgium://catalog`
- Resource: `belgium://catalog.json`
- Resource template: `belgium://domain/{domain}`
- Prompt: `belgium_capability_guide`

This lets the LLM:

- inspect available Belgian domains
- understand which tools belong to which domain
- see whether a domain is live, limited, or requires an API key
- pick the right namespaced tool without guessing

## Example Tool Families

- `irail_get_connections`: passenger rail trip planning
- `irail_get_liveboard`: live departures and arrivals
- `mobility_plan_trip`: intermodal Belgian public transport planning
- `statbel_get_population`: official Belgian population data
- `best_search_addresses`: official Belgian address search
- `airquality_get_belaqi`: nearest BelAQI lookup
- `brussels_search_datasets`: Brussels open data search
- `wallonia_get_records`: Wallonia dataset records
- `kmi_get_hourly_observations`: weather observations from KMI/IRM
- `urban_get_features`: urban.brussels WFS feature retrieval
- `urbis_build_map_url`: public URBIS WMS map URL generation

## Domain Coverage

| Prefix | Domain | Status | Auth | Main data |
| --- | --- | --- | --- | --- |
| `irail_*` | Belgian rail / iRail | Live | None | stations, connections, liveboards, vehicles, disturbances |
| `mobility_*` | Belgian mobility / SMOP | Live | None | intermodal trip planning, operators, GTFS references |
| `stib_*` | STIB/MIVB Brussels transit | Live | API key | stops, waiting times, routes, service messages |
| `infrabel_*` | Infrabel Open Data | Live | None | rail infrastructure datasets and records |
| `kbo_*` | Belgian company registry | Live | API key | enterprise search and company details |
| `best_*` | BeST Belgian addresses | Live | None | addresses, municipalities, streets, postal infos |
| `statbel_*` | Statbel | Live | None | population, CPI, employment, dataset search |
| `airquality_*` | IRCELINE air quality | Live | None | stations, current measurements, BelAQI, timeseries |
| `brussels_*` | Brussels Region open data | Live | None | datasets and records |
| `wallonia_*` | Wallonia open data | Live | None | datasets and records |
| `kmi_*` | KMI / IRM GeoServer | Live | None | stations, hourly observations, WFS discovery |
| `wallonia_geo_*` | Wallonia GeoServices | Live | None | ArcGIS folders, services, layer queries |
| `urban_*` | urban.brussels WFS | Live | None | WFS feature types, schemas, GeoJSON features |
| `urbis_*` | URBIS public WMS | Live | None | WMS layer discovery and map URL generation |
| `datagov_*` | data.gov.be compatibility layer | Limited | None | explicit upstream-changed error surface |
| `flanders_*` | Datavindplaats compatibility layer | Limited | API key | explicit upstream limitation surface |

## Recommended User Path

For most users and most clients, use only:

- npm package: `@belgium-gov-mcp/belgium`
- MCP config entry name: `belgium`

You do not need to configure 10 to 15 separate Belgian MCP servers unless you intentionally want split deployments.

## Local Development

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

Run the aggregated server locally over stdio:

```bash
pnpm --filter @belgium-gov-mcp/belgium start:stdio
```

Run it over Streamable HTTP:

```bash
MCP_TRANSPORT=http PORT_BELGIUM=3017 pnpm --filter @belgium-gov-mcp/belgium start
```

Run all packages in Docker:

```bash
docker compose up --build
```

## Monorepo Structure

- `packages/core`: shared HTTP, retry, cache, rate limiting, XML helpers, and MCP response helpers
- `packages/mcp-belgium`: single aggregated public entry point
- `packages/mcp-*`: domain-specific servers kept modular for testing and maintenance

## Open Data Caveats

This project wraps public upstream APIs. Some Belgian portals change authentication or endpoint contracts over time. When an upstream is no longer publicly compatible, this project prefers explicit, machine-readable limitation errors over silent failure.

Current examples:

- `mcp-stib` requires `STIB_API_KEY`
- `mcp-kbo` requires `CBEAPI_KEY`
- `mcp-data-gov-be` keeps the older contract surface but returns an explicit upstream-changed error
- `mcp-opendata-flanders` keeps the older contract surface but returns an explicit API-key limitation

## Validation Status

The monorepo is validated with:

- `pnpm run build`
- `pnpm run test`
- `pnpm run typecheck`
- `pnpm audit --prod`

## License

MIT. See [LICENSE](./LICENSE).
