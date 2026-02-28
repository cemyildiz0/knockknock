import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase-route";
import { apiError } from "@/lib/api-utils";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return apiError("Email and password are required", 400);
  }

  const supabase = await createRouteClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return apiError(error.message, 401);
  }

  return NextResponse.json({ user: data.user, session: data.session });
}
