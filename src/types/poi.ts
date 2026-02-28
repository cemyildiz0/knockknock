export interface Poi {
  id: number;
  pid: number;
  attom_id: string | null;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  category: string;
  line_of_business: string | null;
  industry: string | null;
  condensed_heading: string | null;
  phone: string | null;
  website: string | null;
  sic_code: string | null;
}

export interface PoiCounts {
  total: number;
  eating_drinking: number;
  health_care: number;
  shopping: number;
  attractions_recreation: number;
  education: number;
}
