export interface Home {
  id: string; // uuid

  // Address
  address_line1: string;
  city: string;
  state: string;
  zip: string;

  // Property details
  property_type: string | null;
  living_area: number | null;   // sq ft
  beds: number | null;
  baths: number | null;         // supports half baths e.g. 2.5
  levels: number | null;

  // Sale
  last_sale_price: number | null;
  last_sale_date: string | null; // ISO date string e.g. "2023-10-20"

  // Media
  image_url: string | null;

  // Reviews
  rating: number | null;
  review_count: number | null;

  created_at: string | null;
}