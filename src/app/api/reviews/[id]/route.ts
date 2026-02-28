import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/auth";
import { apiError } from "@/lib/api-utils";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const { id } = await params;

  const { data: existing, error: fetchError } = await supabase
    .from("reviews")
    .select("user_id")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return apiError("Review not found", 404);
  }

  if (existing.user_id !== auth.user.id) {
    return apiError("Forbidden", 403);
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.rating !== undefined) {
    if (typeof body.rating !== "number" || body.rating < 1 || body.rating > 5) {
      return apiError("rating must be between 1 and 5", 400);
    }
    updates.rating = body.rating;
  }

  if (body.comment !== undefined) {
    if (typeof body.comment !== "string" || body.comment.trim().length === 0) {
      return apiError("comment cannot be empty", 400);
    }
    if (body.comment.length > 2000) {
      return apiError("comment must be 2000 characters or less", 400);
    }
    updates.comment = body.comment.trim();
  }

  if (body.title !== undefined) {
    if (body.title !== null && typeof body.title === "string" && body.title.length > 100) {
      return apiError("title must be 100 characters or less", 400);
    }
    updates.title = body.title?.trim() || null;
  }

  if (Object.keys(updates).length === 0) {
    return apiError("No fields to update", 400);
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("reviews")
    .update(updates)
    .eq("id", id)
    .select("*, profiles(display_name)")
    .single();

  if (error) {
    return apiError(error.message, 500);
  }

  return NextResponse.json(data);
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

  const { data: existing, error: fetchError } = await supabase
    .from("reviews")
    .select("user_id")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return apiError("Review not found", 404);
  }

  if (existing.user_id !== auth.user.id) {
    return apiError("Forbidden", 403);
  }

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", id);

  if (error) {
    return apiError(error.message, 500);
  }

  return NextResponse.json({ success: true });
}
