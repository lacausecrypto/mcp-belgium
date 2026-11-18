# Changelog

## 1.1.0 — 2026-11-18

- **data.gov.be is back**: `datagov_*` tools search the national catalogue (federal, regional and local publishers) through its official data.europa.eu mirror, after data.gov.be retired its CKAN API (#46).
- **KBO/BCE**: `kbo_search_by_activity` now lists companies by NACE code, `kbo_search_enterprise` accepts a postal code, and the missing-key error explains how to set `CBEAPI_KEY` in your MCP client config (#47).
- **Fixed broken tools**: Statbel population/CPI/employment (and a real dataset search plus the new `statbel_get_view`), trip planning (now via Transitous across SNCB, STIB, De Lijn and TEC), BelAQI at any point, Brussels commune boundaries, and Wallonia GeoServices errors that were reported as successes.
- **Faster failures**: client errors (4xx) are no longer retried three times; air-quality stations are sorted by distance.
- **Maintenance**: all dependencies updated (MCP SDK 1.32, zod 4), `pnpm audit --prod` clean, and the server now reports its real version to MCP clients.

## 1.0.4 — 2026-04-21

- Previous release. See the [GitHub releases](https://github.com/lacausecrypto/mcp-belgium/releases) for history before this changelog.
