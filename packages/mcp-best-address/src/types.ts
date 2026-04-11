export interface BestItem {
  id: string;
  [key: string]: unknown;
}

export interface BestCollection<T extends BestItem> {
  self?: string;
  items: T[];
  totalPages?: number;
  pageSize?: number;
  total?: number;
  first?: string;
  last?: string;
}

export interface SearchAddressParams {
  municipalityName?: string;
  postCode?: string;
  streetName?: string;
  houseNumber?: string;
  boxNumber?: string;
  xLong?: number;
  yLat?: number;
  radius?: number;
  crs?: "wgs84" | "lam72" | "lam08";
  limit?: number;
  page?: number;
}

export interface SearchMunicipalityParams {
  name?: string;
  nisCode?: string;
  postCode?: string;
  limit?: number;
  page?: number;
}

export interface SearchStreetParams {
  name?: string;
  municipalityId?: string;
  municipalityName?: string;
  nisCode?: string;
  postCode?: string;
  limit?: number;
  page?: number;
}

export interface SearchPostalInfoParams {
  name?: string;
  postCode?: string;
  limit?: number;
  page?: number;
}
