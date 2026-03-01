import type { Review } from "./review";

export interface Neighborhood {
  id: string;
  name: string;
  city: string;
  description?: string;
  imageUrl?: string;
  saved?: boolean;
  reviews: Review[];
}