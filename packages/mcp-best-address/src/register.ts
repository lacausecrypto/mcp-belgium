import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGetAddressTool } from "./tools/get-address.js";
import { registerSearchAddressesTool } from "./tools/search-addresses.js";
import { registerSearchMunicipalitiesTool } from "./tools/search-municipalities.js";
import { registerSearchPostalInfosTool } from "./tools/search-postal-infos.js";
import { registerSearchStreetsTool } from "./tools/search-streets.js";

export function registerAll(server: McpServer): void {
  registerSearchAddressesTool(server);
  registerGetAddressTool(server);
  registerSearchMunicipalitiesTool(server);
  registerSearchStreetsTool(server);
  registerSearchPostalInfosTool(server);
}
