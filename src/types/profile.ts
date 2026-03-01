import type { CommunityNeighborhood } from "./community-neighborhood";
import type { Home } from "./home";

export interface Profile {
  id: string;
  display_name: string;
  created_at: string;
  saved: CommunityNeighborhood[] | null;
  saved_homes: Home[] | null;
}
