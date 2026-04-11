export type AirQualityStation = Record<string, unknown>;
export type AirQualityTimeseries = Record<string, unknown>;
export type AirQualityDataPoint = Record<string, unknown> | [string, number];

export interface AirQualityStationsResponse {
  stations?: AirQualityStation[];
  results?: AirQualityStation[];
}

export interface AirQualityTimeseriesResponse {
  timeseries?: AirQualityTimeseries[];
  results?: AirQualityTimeseries[];
}

export interface AirQualityDataResponse {
  values?: AirQualityDataPoint[];
  data?: AirQualityDataPoint[];
  results?: AirQualityDataPoint[];
}
