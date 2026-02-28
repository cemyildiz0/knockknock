import { Neighborhood } from "@/types/neighborhood";

export const mockNeighborhoods: Neighborhood[] = [
  {
    id: "1",
    name: "Downtown",
    city: "Irvine",
    description: "Busy urban core with shops and nightlife.",
    reviews: [
      { id: "r1", user: "Alice", rating: 5, comment: "Super walkable!", timestamp: "9/10/2025", likes: 5 },
      { id: "r2", user: "Mike", rating: 4, comment: "Great food options.", timestamp: "9/10/2025", likes: 5 },
    ],
  },
  {
    id: "2",
    name: "Woodbridge",
    city: "Irvine",
    description: "Quiet suburban neighborhood with lakes.",
    reviews: [
      { id: "r3", user: "Emma", rating: 5, comment: "Very peaceful.", timestamp: "9/10/2025", likes: 5 },
      { id: "r4", user: "Chris", rating: 3, comment: "A bit far from city center.", timestamp: "9/10/2025", likes: 5 },
    ],
  },
];