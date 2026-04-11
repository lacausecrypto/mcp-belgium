import { ResourceTemplate, type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { registerAll as registerAirQuality } from "@belgium-gov-mcp/air-quality/register";
import { registerAll as registerBestAddress } from "@belgium-gov-mcp/best-address/register";
import { registerAll as registerDataGovBe } from "@belgium-gov-mcp/data-gov-be/register";
import { registerAll as registerGeoservicesWallonia } from "@belgium-gov-mcp/geoservices-wallonia/register";
import { registerAll as registerInfrabel } from "@belgium-gov-mcp/infrabel/register";
import { registerAll as registerIrail } from "@belgium-gov-mcp/irail/register";
import { registerAll as registerKbo } from "@belgium-gov-mcp/kbo/register";
import { registerAll as registerKmi } from "@belgium-gov-mcp/kmi/register";
import { registerAll as registerMobility } from "@belgium-gov-mcp/mobility/register";
import { registerAll as registerBrussels } from "@belgium-gov-mcp/opendata-brussels/register";
import { registerAll as registerFlanders } from "@belgium-gov-mcp/opendata-flanders/register";
import { registerAll as registerWallonia } from "@belgium-gov-mcp/opendata-wallonia/register";
import { registerAll as registerStatbel } from "@belgium-gov-mcp/statbel/register";
import { registerAll as registerStib } from "@belgium-gov-mcp/stib/register";
import { registerAll as registerUrbanBrussels } from "@belgium-gov-mcp/urban-brussels/register";
import { registerAll as registerUrbis } from "@belgium-gov-mcp/urbis/register";
import {
  BELGIUM_CATALOG_PROMPT,
  describeDomain,
  DOMAIN_CATALOG,
  DOMAIN_IDS,
  findDomainCatalog,
  getCatalogOverview,
  renderCapabilityGuide,
  renderCatalogMarkdown,
  renderDomainResource,
} from "./catalog.js";
import { registerBelgiumCatalogOverviewTool } from "./tools/catalog-overview.js";
import { registerBelgiumDescribeDomainTool } from "./tools/describe-domain.js";
import { registerBelgiumListDomainsTool } from "./tools/list-domains.js";

function registerCatalogResources(server: McpServer): void {
  server.registerResource(
    "belgium_catalog_markdown",
    "belgium://catalog",
    {
      title: "Belgium MCP catalog",
      description: "Human-readable catalog of all Belgian domains and tool prefixes exposed by this server",
      mimeType: "text/markdown",
    },
    async (uri) => ({
      contents: [{ uri: uri.toString(), mimeType: "text/markdown", text: renderCatalogMarkdown() }],
    })
  );

  server.registerResource(
    "belgium_catalog_json",
    "belgium://catalog.json",
    {
      title: "Belgium MCP catalog JSON",
      description: "Structured machine-readable inventory of domains, tools, statuses, and starting points",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.toString(),
          mimeType: "application/json",
          text: JSON.stringify(
            {
              ...getCatalogOverview(),
              domains: DOMAIN_CATALOG.map((domain) => describeDomain(domain.id)),
            },
            null,
            2
          ),
        },
      ],
    })
  );

  server.registerResource(
    "belgium_domain_markdown",
    new ResourceTemplate("belgium://domain/{domain}", {
      list: async () => ({
        resources: DOMAIN_CATALOG.map((domain) => ({
          uri: `belgium://domain/${domain.id}`,
          name: `belgium_domain_${domain.id}`,
          title: domain.title,
          description: domain.summary,
          mimeType: "text/markdown",
        })),
      }),
      complete: {
        domain: (value) => {
          const normalized = value.toLowerCase();
          return DOMAIN_IDS.filter((domainId) => domainId.startsWith(normalized));
        },
      },
    }),
    {
      title: "Belgium domain sheets",
      description: "Per-domain capability sheets with exact tool names, data coverage, upstreams, and caveats",
      mimeType: "text/markdown",
    },
    async (uri, variables) => {
      const requested = String(variables.domain ?? "");
      const domain = findDomainCatalog(requested);
      if (!domain) {
        throw new Error(`Unknown Belgium domain resource: ${requested}`);
      }

      return {
        contents: [{ uri: uri.toString(), mimeType: "text/markdown", text: renderDomainResource(domain.id) }],
      };
    }
  );
}

function registerCatalogPrompt(server: McpServer): void {
  server.registerPrompt(
    BELGIUM_CATALOG_PROMPT,
    {
      title: "Belgium capability guide",
      description: "Explain which Belgian domain and tool prefixes to use for a task, including caveats and key requirements",
      argsSchema: {
        task: z.string().optional().describe("Optional task or user request to map toward the most relevant Belgian domains"),
        domain: z
          .enum(DOMAIN_IDS)
          .optional()
          .describe("Optional exact Belgium domain identifier to focus the guidance on one domain"),
      },
    },
    async ({ task, domain }) => ({
      description: "Guidance for choosing the right Belgian domain tools from the aggregated server.",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: renderCapabilityGuide(task, domain),
          },
        },
      ],
    })
  );
}

export function registerAll(server: McpServer): void {
  registerBelgiumCatalogOverviewTool(server);
  registerBelgiumDescribeDomainTool(server);
  registerBelgiumListDomainsTool(server);
  registerCatalogResources(server);
  registerCatalogPrompt(server);

  registerIrail(server);
  registerMobility(server);
  registerStib(server);
  registerInfrabel(server);
  registerKbo(server);
  registerBestAddress(server);
  registerStatbel(server);
  registerAirQuality(server);
  registerDataGovBe(server);
  registerBrussels(server);
  registerFlanders(server);
  registerWallonia(server);
  registerKmi(server);
  registerGeoservicesWallonia(server);
  registerUrbanBrussels(server);
  registerUrbis(server);
}
