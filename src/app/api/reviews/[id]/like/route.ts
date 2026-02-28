import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/auth";
import { apiError } from "@/lib/api-utils";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const { id } = await params;

  const { data: review } = await supabase
    .from("reviews")
    .select("id")
    .eq("id", id)
    .single();

  if (!review) {
    return apiError("Review not found", 404);
  }

  const { error } = await supabase
    .from("review_likes")
    .insert({
      user_id: auth.user.id,
      review_id: id,
    });

  if (error) {
    if (error.code === "23505") {
      return apiError("Already liked", 409);
    }
    return apiError(error.message, 500);
  }

  const { count } = await supabase
    .from("review_likes")
    .select("id", { count: "exact", head: true })
    .eq("review_id", id);

  return NextResponse.json({ liked: true, like_count: count ?? 0 }, { status: 201 });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const { id } = await params;

  const { error } = await supabase
    .from("review_likes")
    .delete()
    .eq("user_id", auth.user.id)
    .eq("review_id", id);

  if (error) {
    return apiError(error.message, 500);
  }

  const { count } = await supabase
    .from("review_likes")
    .select("id", { count: "exact", head: true })
    .eq("review_id", id);

  return NextResponse.json({ liked: false, like_count: count ?? 0 });
}
