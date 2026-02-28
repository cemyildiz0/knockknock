import { createRouteClient } from "@/lib/supabase-route";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

interface AuthSuccess {
  user: User;
  supabase: SupabaseClient;
  errorResponse: null;
}

interface AuthFailure {
  user: null;
  supabase: SupabaseClient;
  errorResponse: NextResponse;
}

type AuthResult = AuthSuccess | AuthFailure;

export async function requireAuth(): Promise<AuthResult> {
  const supabase = await createRouteClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      user: null,
      supabase,
      errorResponse: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  return { user, supabase, errorResponse: null };
}
