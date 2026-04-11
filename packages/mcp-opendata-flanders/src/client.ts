import type { FlandersDataset, FlandersOrganization } from "./types.js";

const FLANDERS_UNAVAILABLE_MESSAGE =
  "Datavindplaats now requires an API key and no longer exposes the public CKAN endpoints used by this package. See https://www.vlaanderen.be/datavindplaats/api-authenticatie.";

export const flandersClient = {
  async searchDatasets(
    _query: string,
    _tags?: string,
    _organization?: string,
    _rows = 10
  ): Promise<FlandersDataset[]> {
    throw new Error(FLANDERS_UNAVAILABLE_MESSAGE);
  },

  async getDataset(_datasetId: string): Promise<FlandersDataset> {
    throw new Error(FLANDERS_UNAVAILABLE_MESSAGE);
  },

  async listOrganizations(_limit = 25): Promise<FlandersOrganization[]> {
    throw new Error(FLANDERS_UNAVAILABLE_MESSAGE);
  },
};
