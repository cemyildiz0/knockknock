import { NextResponse } from "next/server";

export function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function parsePagination(
  searchParams: URLSearchParams,
  defaults?: { limit?: number }
) {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const maxLimit = 50;
  const defaultLimit = defaults?.limit ?? 20;
  const limit = Math.min(
    maxLimit,
    Math.max(1, parseInt(searchParams.get("limit") ?? String(defaultLimit), 10))
  );
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function paginationMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    total_pages: Math.ceil(total / limit),
  };
}
