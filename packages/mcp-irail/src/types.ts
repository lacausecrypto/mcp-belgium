export interface IrailStation {
  id: string;
  name: string;
  locationX: string;
  locationY: string;
  standardname: string;
}

export interface StationsResponse {
  station: IrailStation[];
}

export interface Connection {
  departure: { station: string; time: string; platform: string; delay: string };
  arrival: { station: string; time: string; platform: string; delay: string };
  duration: string;
  vias?: { via: Array<{ station: string; arrival: { time: string }; departure: { time: string } }> };
}

export interface ConnectionsResponse {
  connection: Connection[];
}

export interface LiveboardDeparture {
  station: string;
  time: string;
  delay: string;
  platform: string;
  vehicle: string;
  canceled: string;
}

export interface LiveboardResponse {
  stationinfo: { name: string };
  departures: { departure: LiveboardDeparture[] };
}

export interface VehicleStop {
  station: string;
  time: string;
  delay: string;
  platform: string;
  arrived: string;
  left: string;
}

export interface VehicleResponse {
  vehicleinfo: { name: string; shortname: string };
  stops: { stop: VehicleStop[] };
}

export interface DisturbanceItem {
  title: string;
  description: string;
  link: string;
  timestamp: string;
}

export interface DisturbancesResponse {
  disturbance: DisturbanceItem[];
}
