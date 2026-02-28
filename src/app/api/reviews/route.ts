import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/auth";
import { apiError, parsePagination, paginationMeta } from "@/lib/api-utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const addressPointId = searchParams.get("address_point_id");

  if (!addressPointId) {
    return apiError("address_point_id is required", 400);
  }

  const numericId = Number(addressPointId);
  if (isNaN(numericId)) {
    return apiError("Invalid address_point_id", 400);
  }

  const { page, limit, offset } = parsePagination(searchParams);
  const sort = searchParams.get("sort") ?? "newest";

  let sortColumn = "created_at";
  let ascending = false;

  switch (sort) {
    case "oldest":
      sortColumn = "created_at";
      ascending = true;
      break;
    case "highest":
      sortColumn = "rating";
      ascending = false;
      break;
    case "lowest":
      sortColumn = "rating";
      ascending = true;
      break;
    default:
      sortColumn = "created_at";
      ascending = false;
  }

  const { data, error, count } = await supabase
    .from("reviews")
    .select("*, profiles(display_name), review_likes(count)", { count: "exact" })
    .eq("address_point_id", numericId)
    .order(sortColumn, { ascending })
    .range(offset, offset + limit - 1);

  if (error) {
    return apiError(error.message, 500);
  }

  const reviews = (data ?? []).map((review) => {
    const likeAgg = review.review_likes as unknown as Array<{ count: number }> | undefined;
    const likeCount = likeAgg?.[0]?.count ?? 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { review_likes, ...rest } = review;
    return { ...rest, like_count: likeCount };
  });

  return NextResponse.json({
    data: reviews,
    pagination: paginationMeta(page, limit, count ?? 0),
  });
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const body = await request.json();
  const { address_point_id, rating, title, comment } = body;

  if (!address_point_id || typeof address_point_id !== "number") {
    return apiError("address_point_id is required and must be a number", 400);
  }

  if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
    return apiError("rating must be between 1 and 5", 400);
  }

  if (!comment || typeof comment !== "string" || comment.trim().length === 0) {
    return apiError("comment is required", 400);
  }

  if (comment.length > 2000) {
    return apiError("comment must be 2000 characters or less", 400);
  }

  if (title && typeof title === "string" && title.length > 100) {
    return apiError("title must be 100 characters or less", 400);
  }

  const { data: addressExists, error: addressError } = await supabase
    .from("address_points")
    .select("id")
    .eq("id", address_point_id)
    .single();

  if (addressError || !addressExists) {
    return apiError("Address not found", 404);
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      user_id: auth.user.id,
      address_point_id,
      rating,
      title: title?.trim() || null,
      comment: comment.trim(),
    })
    .select("*, profiles(display_name)")
    .single();

  if (error) {
    if (error.code === "23505") {
      return apiError("You have already reviewed this address", 409);
    }
    return apiError(error.message, 500);
  }

  return NextResponse.json(data, { status: 201 });
}
