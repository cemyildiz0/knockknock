import { Neighborhood } from "@/types/neighborhood";

export const mockNeighborhoods: Neighborhood[] = [
  {
    id: "1",
    name: "Downtown",
    city: "Irvine",
    description: "Busy urban core with shops and nightlife.",
    reviews: [
      {
        id: "r1",
        user_id: "mock-user-1",
        address_point_id: 1,
        rating: 5,
        title: null,
        comment: "Super walkable!",
        created_at: "2025-09-10T00:00:00Z",
        updated_at: "2025-09-10T00:00:00Z",
        profiles: { display_name: "Alice" },
      },
      {
        id: "r2",
        user_id: "mock-user-2",
        address_point_id: 1,
        rating: 4,
        title: null,
        comment: "Great food options.",
        created_at: "2025-09-10T00:00:00Z",
        updated_at: "2025-09-10T00:00:00Z",
        profiles: { display_name: "Mike" },
      },
    ],
  },
  {
    id: "2",
    name: "Woodbridge",
    city: "Irvine",
    description: "Quiet suburban neighborhood with lakes.",
    reviews: [
      {
        id: "r3",
        user_id: "mock-user-3",
        address_point_id: 2,
        rating: 5,
        title: null,
        comment: "Very peaceful.",
        created_at: "2025-09-10T00:00:00Z",
        updated_at: "2025-09-10T00:00:00Z",
        profiles: { display_name: "Emma" },
      },
      {
        id: "r4",
        user_id: "mock-user-4",
        address_point_id: 2,
        rating: 3,
        title: null,
        comment: "A bit far from city center.",
        created_at: "2025-09-10T00:00:00Z",
        updated_at: "2025-09-10T00:00:00Z",
        profiles: { display_name: "Chris" },
      },
    ],
  },
];
