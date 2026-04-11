export const DOMAIN_IDS = [
  "irail",
  "mobility",
  "stib",
  "infrabel",
  "kbo",
  "best-address",
  "statbel",
  "air-quality",
  "data-gov-be",
  "brussels",
  "flanders",
  "wallonia",
  "kmi",
  "geoservices-wallonia",
  "urban-brussels",
  "urbis",
] as const;

export type BelgiumDomainId = (typeof DOMAIN_IDS)[number];
export type BelgiumDomainStatus = "live" | "requires-key" | "limited";
export type BelgiumDomainAuth = "none" | "required-key";

export interface BelgiumDomainCatalog {
  id: BelgiumDomainId;
  title: string;
  packageName: string;
  category: string;
  upstream: string;
  auth: BelgiumDomainAuth;
  status: BelgiumDomainStatus;
  summary: string;
  dataAvailable: readonly string[];
  llmUseCases: readonly string[];
  toolNames: readonly string[];
  notes: readonly string[];
}

export const BELGIUM_CATALOG_TOOL_NAMES = [
  "belgium_catalog_overview",
  "belgium_describe_domain",
  "belgium_list_domains",
] as const;

export const BELGIUM_CATALOG_RESOURCE_URIS = [
  "belgium://catalog",
  "belgium://catalog.json",
  "belgium://domain/{domain}",
] as const;

export const BELGIUM_CATALOG_PROMPT = "belgium_capability_guide";

export const DOMAIN_CATALOG: readonly BelgiumDomainCatalog[] = [
  {
    id: "irail",
    title: "iRail Belgian Rail",
    packageName: "@lacausecrypto/irail",
    category: "transport",
    upstream: "https://api.irail.be",
    auth: "none",
    status: "live",
    summary: "Belgian rail journeys and live train operations from the public iRail API.",
    dataAvailable: [
      "station search and identifiers",
      "train connections between stations",
      "live departures and arrivals",
      "vehicle stop lists and delays",
      "network disturbances and maintenance notices",
    ],
    llmUseCases: [
      "Train trip planning inside Belgium",
      "Live SNCB/NMBS departure lookup",
      "Checking a train number or vehicle path",
    ],
    toolNames: [
      "irail_search_stations",
      "irail_get_connections",
      "irail_get_liveboard",
      "irail_get_vehicle",
      "irail_get_disturbances",
    ],
    notes: ["Best starting point for passenger rail questions."],
  },
  {
    id: "mobility",
    title: "Belgian Mobility / SMOP",
    packageName: "@lacausecrypto/mobility",
    category: "transport",
    upstream: "https://opendata-portal.api.production.belgianmobility.io",
    auth: "none",
    status: "live",
    summary: "Intermodal public transport planning layer spanning multiple Belgian operators.",
    dataAvailable: [
      "intermodal trip plans",
      "operator directory",
      "GTFS and GTFS-RT feed references",
    ],
    llmUseCases: [
      "Multi-operator trip planning",
      "Understanding Belgian public transport feed sources",
      "Choosing between operators before calling operator-specific tools",
    ],
    toolNames: ["mobility_plan_trip", "mobility_get_operators", "mobility_get_gtfs_feeds"],
    notes: [
      "Use when the user needs multimodal routing, not only rail.",
      "Complements iRail rather than replacing it.",
    ],
  },
  {
    id: "stib",
    title: "STIB-MIVB Brussels Transit",
    packageName: "@lacausecrypto/stib",
    category: "transport",
    upstream: "https://data.stib-mivb.brussels/api/v2",
    auth: "required-key",
    status: "requires-key",
    summary: "Brussels metro, tram, and bus stop data from the official STIB OpenDataSoft API.",
    dataAvailable: [
      "waiting times by stop",
      "stop search",
      "line metadata",
      "service disruption messages",
    ],
    llmUseCases: [
      "Brussels local public transport questions",
      "Looking up STIB stops or waiting times",
      "Checking current STIB disruptions",
    ],
    toolNames: [
      "stib_get_waiting_times",
      "stib_search_stops",
      "stib_get_route",
      "stib_get_messages",
    ],
    notes: [
      "Requires STIB_API_KEY on tool calls.",
      "If no key is configured, tools return an explicit setup error.",
    ],
  },
  {
    id: "infrabel",
    title: "Infrabel Open Data",
    packageName: "@lacausecrypto/infrabel",
    category: "transport",
    upstream: "https://opendata.infrabel.be/api/explore/v2.1",
    auth: "none",
    status: "live",
    summary: "Public rail infrastructure datasets exposed by Infrabel through OpenDataSoft.",
    dataAvailable: [
      "dataset search",
      "dataset metadata",
      "records from specific rail infrastructure datasets",
    ],
    llmUseCases: [
      "Rail infrastructure or operations datasets",
      "Exploring Infrabel open data collections",
      "Querying ODS records after finding a dataset",
    ],
    toolNames: ["infrabel_search_datasets", "infrabel_get_dataset", "infrabel_get_records"],
    notes: ["Useful for infrastructure and network datasets beyond passenger journey planning."],
  },
  {
    id: "kbo",
    title: "KBO / BCE Company Registry",
    packageName: "@lacausecrypto/kbo",
    category: "business",
    upstream: "https://cbeapi.be",
    auth: "required-key",
    status: "requires-key",
    summary: "Belgian enterprise lookup against the current CBEAPI service for KBO/BCE data.",
    dataAvailable: [
      "enterprise search by name or number",
      "enterprise detail lookup",
      "limited activity search coverage",
    ],
    llmUseCases: [
      "Looking up a Belgian company by BCE number",
      "Resolving enterprise names to registry records",
      "Explaining KBO availability and key requirements",
    ],
    toolNames: ["kbo_search_enterprise", "kbo_get_enterprise", "kbo_search_by_activity"],
    notes: [
      "Requires CBEAPI_KEY on tool calls.",
      "The activity search tool is registered but currently returns a documented unsupported error because the current upstream does not expose a public company-by-NACE endpoint.",
    ],
  },
  {
    id: "best-address",
    title: "BeST Belgian Addresses",
    packageName: "@lacausecrypto/best-address",
    category: "administration",
    upstream: "https://best.pr.fedservices.be/api/opendata/best/v1",
    auth: "none",
    status: "live",
    summary: "Official Belgian address registry covering addresses, municipalities, streets, and postal information.",
    dataAvailable: [
      "address search by locality or coordinates",
      "single address lookup",
      "municipality search",
      "street search",
      "postal information lookup",
    ],
    llmUseCases: [
      "Normalizing Belgian addresses",
      "Finding municipalities, streets, or postcodes",
      "Resolving an official address identifier",
    ],
    toolNames: [
      "best_search_addresses",
      "best_get_address",
      "best_search_municipalities",
      "best_search_streets",
      "best_search_postal_infos",
    ],
    notes: ["Best starting point for official Belgian address data."],
  },
  {
    id: "statbel",
    title: "Statbel Statistics",
    packageName: "@lacausecrypto/statbel",
    category: "statistics",
    upstream: "https://bestat.statbel.fgov.be/bestat/api/views",
    auth: "none",
    status: "live",
    summary: "Belgian statistical datasets and prebuilt indicators from Statbel beSTAT.",
    dataAvailable: [
      "dataset search",
      "population statistics",
      "consumer price index data",
      "employment statistics",
    ],
    llmUseCases: [
      "Population and demographic questions",
      "Inflation or CPI lookups",
      "Employment and labor indicator queries",
    ],
    toolNames: [
      "statbel_search_datasets",
      "statbel_get_population",
      "statbel_get_cpi",
      "statbel_get_employment",
    ],
    notes: ["Use for official Belgian statistics before falling back to generic open data portals."],
  },
  {
    id: "air-quality",
    title: "IRCELINE Air Quality",
    packageName: "@lacausecrypto/air-quality",
    category: "environment",
    upstream: "https://geo.irceline.be/sos/api/v1",
    auth: "none",
    status: "live",
    summary: "Belgian air quality monitoring stations, measurements, and BelAQI proximity lookups.",
    dataAvailable: [
      "nearby monitoring stations",
      "current measurements by station",
      "BelAQI index from nearest station",
      "historical timeseries data",
    ],
    llmUseCases: [
      "Checking local air quality",
      "Finding nearby monitoring stations",
      "Retrieving measurement history for a station",
    ],
    toolNames: [
      "airquality_search_stations",
      "airquality_get_current",
      "airquality_get_belaqi",
      "airquality_get_timeseries",
    ],
    notes: ["Best choice for live environmental air quality questions."],
  },
  {
    id: "data-gov-be",
    title: "data.gov.be Federal Open Data",
    packageName: "@lacausecrypto/data-gov-be",
    category: "open-data",
    upstream: "https://data.gov.be",
    auth: "none",
    status: "limited",
    summary: "Federal open data portal compatibility layer for the historic CKAN API surface from the original spec.",
    dataAvailable: [
      "catalog search shape from the original CKAN design",
      "dataset metadata shape",
      "organization listing shape",
      "resource metadata shape",
    ],
    llmUseCases: [
      "Explaining why the old data.gov.be CKAN contract no longer works",
      "Keeping compatibility in one aggregated server",
    ],
    toolNames: [
      "datagov_search_datasets",
      "datagov_get_dataset",
      "datagov_list_organizations",
      "datagov_get_resource",
    ],
    notes: [
      "Current tools intentionally return a clear upstream-changed error.",
      "The public portal no longer exposes the CKAN /api/3/action endpoints expected by the original spec.",
    ],
  },
  {
    id: "brussels",
    title: "Brussels Region Open Data",
    packageName: "@lacausecrypto/opendata-brussels",
    category: "open-data",
    upstream: "https://opendata.brussels.be/api/explore/v2.1",
    auth: "none",
    status: "live",
    summary: "Brussels Region open datasets and records through the public OpenDataSoft Explore API.",
    dataAvailable: [
      "dataset search",
      "dataset metadata",
      "record extraction with optional ODS where clauses",
    ],
    llmUseCases: [
      "Brussels regional datasets",
      "Querying records after dataset discovery",
      "Regional open data exploration for Brussels",
    ],
    toolNames: ["brussels_search_datasets", "brussels_get_dataset", "brussels_get_records"],
    notes: ["Good general-purpose Brussels open data entry point."],
  },
  {
    id: "flanders",
    title: "Flanders Datavindplaats",
    packageName: "@lacausecrypto/opendata-flanders",
    category: "open-data",
    upstream: "https://www.vlaanderen.be/datavindplaats",
    auth: "required-key",
    status: "limited",
    summary: "Compatibility layer for the older public Flemish CKAN pattern described in the original spec.",
    dataAvailable: [
      "dataset search shape",
      "dataset detail shape",
      "organization listing shape",
    ],
    llmUseCases: [
      "Explaining the current Flemish API key requirement",
      "Preserving one consolidated interface for the workspace",
    ],
    toolNames: ["flanders_search_datasets", "flanders_get_dataset", "flanders_list_organizations"],
    notes: [
      "Current tools intentionally return a clear upstream limitation.",
      "Datavindplaats now requires an API key and no longer matches the public CKAN contract from the original spec.",
    ],
  },
  {
    id: "wallonia",
    title: "Wallonia Open Data",
    packageName: "@lacausecrypto/opendata-wallonia",
    category: "open-data",
    upstream: "https://www.odwb.be/api/explore/v2.1",
    auth: "none",
    status: "live",
    summary: "Walloon Region open datasets and records through the public OpenDataSoft Explore API.",
    dataAvailable: [
      "dataset search",
      "dataset metadata",
      "record extraction with optional ODS where clauses",
    ],
    llmUseCases: [
      "Walloon regional datasets",
      "Querying specific ODS records from Wallonia",
      "Regional open data exploration for Wallonia",
    ],
    toolNames: ["wallonia_search_datasets", "wallonia_get_dataset", "wallonia_get_records"],
    notes: ["Good general-purpose Wallonia open data entry point."],
  },
  {
    id: "kmi",
    title: "KMI / IRM Weather GeoServer",
    packageName: "@lacausecrypto/kmi",
    category: "environment",
    upstream: "https://opendata.meteo.be/geoserver/ows",
    auth: "none",
    status: "live",
    summary: "Public KMI/IRM GeoServer access to weather stations, hourly observations, and other WFS feature types.",
    dataAvailable: [
      "feature type discovery",
      "schema inspection",
      "GeoJSON feature retrieval",
      "weather stations",
      "hourly observation features",
    ],
    llmUseCases: [
      "Weather station lookups",
      "Pulling WFS weather observations",
      "Inspecting KMI schemas before querying",
    ],
    toolNames: [
      "kmi_list_feature_types",
      "kmi_describe_feature_type",
      "kmi_get_features",
      "kmi_get_stations",
      "kmi_get_hourly_observations",
    ],
    notes: ["Use for structured meteorological geodata, not forecast prose."],
  },
  {
    id: "geoservices-wallonia",
    title: "Wallonia GeoServices ArcGIS REST",
    packageName: "@lacausecrypto/geoservices-wallonia",
    category: "geospatial",
    upstream: "https://geoservices.wallonie.be/arcgis/rest/services",
    auth: "none",
    status: "live",
    summary: "ArcGIS REST directory and feature layer querying for Wallonia GeoServices.",
    dataAvailable: [
      "top-level folder listing",
      "service listing per folder",
      "service metadata",
      "feature layer querying",
    ],
    llmUseCases: [
      "Exploring Wallonia ArcGIS services",
      "Finding a service before querying a layer",
      "Retrieving feature attributes from public ArcGIS layers",
    ],
    toolNames: [
      "wallonia_geo_list_folders",
      "wallonia_geo_list_services",
      "wallonia_geo_get_service",
      "wallonia_geo_query_layer",
    ],
    notes: ["Best for ArcGIS REST browsing and attribute queries in Wallonia."],
  },
  {
    id: "urban-brussels",
    title: "urban.brussels WFS",
    packageName: "@lacausecrypto/urban-brussels",
    category: "geospatial",
    upstream: "https://gis.urban.brussels/geoserver/wfs",
    auth: "none",
    status: "live",
    summary: "Public urban.brussels GeoServer WFS access to Brussels planning and boundary layers.",
    dataAvailable: [
      "feature type discovery",
      "schema inspection",
      "GeoJSON feature retrieval",
      "municipality boundaries shortcut",
    ],
    llmUseCases: [
      "Brussels geospatial feature queries",
      "Inspecting available WFS layers",
      "Retrieving municipality boundary geometries",
    ],
    toolNames: [
      "urban_list_feature_types",
      "urban_describe_feature_type",
      "urban_get_features",
      "urban_get_municipalities_boundaries",
    ],
    notes: ["Best for public WFS feature retrieval on urban.brussels data."],
  },
  {
    id: "urbis",
    title: "URBIS Public WMS",
    packageName: "@lacausecrypto/urbis",
    category: "geospatial",
    upstream: "https://geoservices-urbis.irisnet.be/geoserver/Urbis/wms",
    auth: "none",
    status: "live",
    summary: "Public URBIS WMS layer discovery and map URL generation for Brussels basemaps.",
    dataAvailable: [
      "vector and raster WMS layer listing",
      "single-layer metadata",
      "GetMap URL construction",
    ],
    llmUseCases: [
      "Finding available URBIS map layers",
      "Building a public WMS map request URL",
      "Understanding whether URBIS exposes WMS rather than WFS",
    ],
    toolNames: ["urbis_list_layers", "urbis_get_layer", "urbis_build_map_url"],
    notes: ["This domain is map-service oriented and currently exposes WMS metadata and URL generation."],
  },
] as const;

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase();
}

function scoreDomain(domain: BelgiumDomainCatalog, query?: string): number {
  if (!query) return 1;

  const normalized = normalizeSearchText(query);
  if (!normalized) return 1;

  const terms = normalized.split(/\s+/).filter(Boolean);
  const titleHaystack = `${domain.id} ${domain.title} ${domain.category}`.toLowerCase();
  const fullHaystack = [
    domain.summary,
    ...domain.dataAvailable,
    ...domain.llmUseCases,
    ...domain.toolNames,
    ...domain.notes,
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;
  if (titleHaystack.includes(normalized)) score += 6;
  if (fullHaystack.includes(normalized)) score += 3;

  for (const term of terms) {
    if (titleHaystack.includes(term)) score += 2;
    if (fullHaystack.includes(term)) score += 1;
  }

  return score;
}

function domainSnapshot(domain: BelgiumDomainCatalog, includeTools: boolean) {
  return {
    id: domain.id,
    title: domain.title,
    category: domain.category,
    status: domain.status,
    auth: domain.auth,
    summary: domain.summary,
    dataAvailable: [...domain.dataAvailable],
    llmUseCases: [...domain.llmUseCases],
    notes: [...domain.notes],
    ...(includeTools ? { toolNames: [...domain.toolNames] } : {}),
  };
}

export function getDomainCatalog(domainId: BelgiumDomainId): BelgiumDomainCatalog {
  const domain = DOMAIN_CATALOG.find((item) => item.id === domainId);
  if (!domain) {
    throw new Error(`Unknown Belgium domain: ${domainId}`);
  }
  return domain;
}

export function findDomainCatalog(domainId: string): BelgiumDomainCatalog | undefined {
  return DOMAIN_CATALOG.find((item) => item.id === domainId);
}

export function listDomainCatalog(options?: {
  query?: string;
  onlyPublicNoKey?: boolean;
  includeTools?: boolean;
}) {
  const { query, onlyPublicNoKey = false, includeTools = true } = options ?? {};

  const filtered = DOMAIN_CATALOG.filter((domain) => {
    if (onlyPublicNoKey && (domain.status !== "live" || domain.auth !== "none")) {
      return false;
    }
    return scoreDomain(domain, query) > 0;
  }).sort((left, right) => scoreDomain(right, query) - scoreDomain(left, query));

  return {
    query: query ?? null,
    onlyPublicNoKey,
    count: filtered.length,
    domains: filtered.map((domain) => domainSnapshot(domain, includeTools)),
  };
}

export function suggestDomainsForTask(task?: string, limit = 5): BelgiumDomainCatalog[] {
  if (!task?.trim()) {
    return DOMAIN_CATALOG.slice(0, limit);
  }

  return [...DOMAIN_CATALOG]
    .map((domain) => ({ domain, score: scoreDomain(domain, task) }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((item) => item.domain);
}

export function getCatalogOverview() {
  const domainsByStatus = {
    live: DOMAIN_CATALOG.filter((domain) => domain.status === "live").map((domain) => domain.id),
    requiresKey: DOMAIN_CATALOG.filter((domain) => domain.status === "requires-key").map((domain) => domain.id),
    limited: DOMAIN_CATALOG.filter((domain) => domain.status === "limited").map((domain) => domain.id),
  };

  const domainsByCategory = Object.fromEntries(
    [...new Set(DOMAIN_CATALOG.map((domain) => domain.category))]
      .sort()
      .map((category) => [
        category,
        DOMAIN_CATALOG.filter((domain) => domain.category === category).map((domain) => ({
          id: domain.id,
          title: domain.title,
          status: domain.status,
        })),
      ])
  );

  const domainToolCount = DOMAIN_CATALOG.reduce((sum, domain) => sum + domain.toolNames.length, 0);

  return {
    server: {
      name: "mcp-belgium",
      packageName: "mcp-belgium",
      recommendedConfigName: "belgium",
    },
    counts: {
      domains: DOMAIN_CATALOG.length,
      catalogTools: BELGIUM_CATALOG_TOOL_NAMES.length,
      domainTools: domainToolCount,
      totalToolsExposed: domainToolCount + BELGIUM_CATALOG_TOOL_NAMES.length,
    },
    catalog: {
      tools: [...BELGIUM_CATALOG_TOOL_NAMES],
      resources: [...BELGIUM_CATALOG_RESOURCE_URIS],
      prompt: BELGIUM_CATALOG_PROMPT,
    },
    domainsByStatus,
    domainsByCategory,
    recommendedStartingPoints: [
      {
        useCase: "Passenger rail journeys and train status",
        domain: "irail",
        tools: ["irail_get_connections", "irail_get_liveboard", "irail_get_disturbances"],
      },
      {
        useCase: "Intermodal public transport across operators",
        domain: "mobility",
        tools: ["mobility_plan_trip", "mobility_get_operators"],
      },
      {
        useCase: "Official addresses, streets, municipalities, and postcodes",
        domain: "best-address",
        tools: ["best_search_addresses", "best_search_streets", "best_search_municipalities"],
      },
      {
        useCase: "Official Belgian statistics",
        domain: "statbel",
        tools: ["statbel_get_population", "statbel_get_cpi", "statbel_get_employment"],
      },
      {
        useCase: "Brussels and Wallonia open data portals",
        domain: "brussels",
        tools: ["brussels_search_datasets", "wallonia_search_datasets"],
      },
      {
        useCase: "Public geospatial layers and schemas",
        domain: "kmi",
        tools: ["kmi_list_feature_types", "urban_list_feature_types", "urbis_list_layers"],
      },
    ],
  };
}

export function describeDomain(domainId: BelgiumDomainId) {
  const domain = getDomainCatalog(domainId);
  return {
    ...domainSnapshot(domain, true),
    upstream: domain.upstream,
    packageName: domain.packageName,
    resourceUri: `belgium://domain/${domain.id}`,
    relatedCatalogTools: [...BELGIUM_CATALOG_TOOL_NAMES],
    prompt: BELGIUM_CATALOG_PROMPT,
  };
}

function renderDomainMarkdown(domain: BelgiumDomainCatalog): string {
  return [
    `## ${domain.title} (\`${domain.id}\`)`,
    ``,
    `- Package: \`${domain.packageName}\``,
    `- Category: \`${domain.category}\``,
    `- Status: \`${domain.status}\``,
    `- Auth: \`${domain.auth}\``,
    `- Upstream: ${domain.upstream}`,
    `- Summary: ${domain.summary}`,
    `- Data available: ${domain.dataAvailable.join("; ")}`,
    `- Use when: ${domain.llmUseCases.join("; ")}`,
    `- Tools: ${domain.toolNames.join(", ")}`,
    `- Notes: ${domain.notes.join("; ")}`,
  ].join("\n");
}

export function renderCatalogMarkdown(): string {
  const overview = getCatalogOverview();
  const intro = [
    "# Belgium MCP Catalog",
    "",
    `This single MCP server exposes ${overview.counts.domainTools} domain tools across ${overview.counts.domains} Belgian data domains, plus ${overview.counts.catalogTools} catalog tools for orientation.`,
    "",
    "## How To Navigate",
    "",
    "- All domain tools are directly callable from this one server.",
    "- Tool names are namespaced by prefix, for example `irail_*`, `statbel_*`, `best_*`, `urban_*`, or `urbis_*`.",
    "- Start with `belgium_list_domains` when the user intent is broad.",
    "- Use `belgium_describe_domain` when you need exact tool names, caveats, and data coverage for one domain.",
    "- Read `belgium://catalog.json` when a structured machine-readable inventory is easier than prose.",
    "",
    "## Domain Sheets",
  ].join("\n");

  return `${intro}\n\n${DOMAIN_CATALOG.map(renderDomainMarkdown).join("\n\n")}\n`;
}

export function renderDomainResource(domainId: BelgiumDomainId): string {
  return renderDomainMarkdown(getDomainCatalog(domainId));
}

export function renderCapabilityGuide(task?: string, domainId?: BelgiumDomainId): string {
  const selectedDomain = domainId ? getDomainCatalog(domainId) : undefined;
  const suggestions = selectedDomain ? [selectedDomain] : suggestDomainsForTask(task, 5);

  const lines = [
    "You are connected to mcp-belgium, a single MCP server that already aggregates all Belgian subdomains.",
    "All tools are directly callable from this server; there is no second hop to another MCP server.",
    "When the intent is ambiguous, use belgium_list_domains or read belgium://catalog first.",
    "Prefer live no-key domains when they satisfy the request, and surface key or upstream limitations explicitly when relevant.",
    "",
  ];

  if (domainId) {
    lines.push(`Focus domain: ${selectedDomain?.title} (\`${domainId}\`)`);
  } else if (task?.trim()) {
    lines.push(`Task hint: ${task.trim()}`);
  } else {
    lines.push("No task hint was provided.");
  }

  lines.push("", "Recommended domains and tools:");

  for (const domain of suggestions) {
    lines.push(
      `- ${domain.id}: ${domain.summary}`,
      `  Data: ${domain.dataAvailable.join("; ")}`,
      `  Tools: ${domain.toolNames.join(", ")}`,
      `  Caveats: ${domain.notes.join("; ")}`
    );
  }

  lines.push(
    "",
    "If you still need a structured inventory, use:",
    "- Tool: belgium_catalog_overview",
    "- Tool: belgium_describe_domain",
    "- Resource: belgium://catalog.json"
  );

  return lines.join("\n");
}
