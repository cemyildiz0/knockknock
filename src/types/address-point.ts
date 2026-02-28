export interface AddressPoint {
  id: number;
  address: string;
  prefix: string | null;
  pretype: string | null;
  name: string;
  sttype: string | null;
  suffix: string | null;
  unit: string | null;
  streetname: string;
  pa: number;
  code: string;
  status: number;
  res: string;
  mun: string;
  longitude: number;
  latitude: number;
}

export interface AddressPointSummary {
  id: number;
  address: string;
  streetname: string;
  unit: string | null;
  mun: string;
  latitude: number;
  longitude: number;
}
