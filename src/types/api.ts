export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface SearchResults {
  results: {
    neighborhoods: Array<{
      id: number;
      name: string;
      center_lat: number | null;
      center_lng: number | null;
      type: "neighborhood";
    }>;
    addresses: Array<{
      id: number;
      address: string;
      streetname: string;
      unit: string | null;
      mun: string;
      latitude: number;
      longitude: number;
      type: "address";
    }>;
    pois: Array<{
      id: number;
      name: string;
      address: string | null;
      city: string | null;
      category: string;
      zip_code: string | null;
      type: "poi";
    }>;
    zips: Array<{
      id: number;
      geoid: string;
      score: number;
      type: "zip";
    }>;
  };
  query: string;
}

export interface ReviewSummary {
  address_point_id: number;
  average_rating: number | null;
  total_reviews: number;
  distribution: Record<number, number>;
}
