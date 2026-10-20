import { NextResponse } from "next/server";
import { search } from "../../../lib/ninjas";

export async function GET(req) {
  const p = new URL(req.url).searchParams;
  const q = (p.get("q") || "").trim();
  if (q.length < 2) return NextResponse.json({ error: "Type at least 2 characters" }, { status: 400 });
  if (!process.env.API_NINJAS_KEY) return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  const results = await search({ q, type: p.get("type") });
  return NextResponse.json({ count: results.length, results }, {
    headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate" },
  });
}