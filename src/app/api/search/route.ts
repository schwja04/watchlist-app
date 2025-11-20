import { NextResponse } from "next/server";
import { searchMovies } from "~/server/externalServices/tmdb/tmdbClient";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") ?? "";
  const page = Number(searchParams.get("page") ?? "1");

  if (!query.trim()) {
    return NextResponse.json({
      results: [],
      page: 1,
      total_pages: 0,
      total_results: 0,
    });
  }

  try {
    const results = await searchMovies(query, page);
    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
