export interface Review {
  id: string;
  user_id: string;
  address_point_id: number;
  rating: number;
  title: string | null;
  comment: string;
  created_at: string;
  updated_at: string;
  like_count?: number;
  liked_by_user?: boolean;
  profiles?: {
    display_name: string;
  };
}

export interface ReviewWithProfile extends Review {
  profiles: {
    display_name: string;
  };
}

export interface ReviewLike {
  id: string;
  user_id: string;
  review_id: string;
  created_at: string;
}

export interface CreateReviewBody {
  address_point_id: number;
  rating: number;
  title?: string;
  comment: string;
}

export interface UpdateReviewBody {
  rating?: number;
  title?: string;
  comment?: string;
}
