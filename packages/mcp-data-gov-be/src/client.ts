import type { CkanDataset, CkanOrganization, CkanResource } from "./types.js";

const DATA_GOV_BE_UNAVAILABLE_MESSAGE =
  "data.gov.be no longer exposes the CKAN /api/3/action endpoints used by this package. The current portal points to API/RSS and linked-data access instead, so these tools need a redesign before they can work again.";

export const dataGovBeClient = {
  async searchDatasets(
    _query: string,
    _tags?: string,
    _organization?: string,
    _rows = 10
  ): Promise<CkanDataset[]> {
    throw new Error(DATA_GOV_BE_UNAVAILABLE_MESSAGE);
  },

  async getDataset(_datasetId: string): Promise<CkanDataset> {
    throw new Error(DATA_GOV_BE_UNAVAILABLE_MESSAGE);
  },

  async listOrganizations(_limit = 25): Promise<CkanOrganization[]> {
    throw new Error(DATA_GOV_BE_UNAVAILABLE_MESSAGE);
  },

  async getResource(_resourceId: string): Promise<CkanResource> {
    throw new Error(DATA_GOV_BE_UNAVAILABLE_MESSAGE);
  },
};
