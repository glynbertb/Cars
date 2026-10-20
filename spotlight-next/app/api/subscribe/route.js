import { NextResponse } from "next/server";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const fav = String(body?.fav || "").trim();

  if (name.length < 2) return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
  if (!EMAIL.test(email)) return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  if (fav !== "car" && fav !== "bike")
    return NextResponse.json({ error: "Favorite type must be 'car' or 'bike'" }, { status: 400 });

  console.log("[subscribe]", { name, email, fav, at: new Date().toISOString() });
  // TODO: connect a real email service (e.g. Resend / Mailchimp) here.

  return NextResponse.json({ ok: true, message: "You're on the list. Welcome to Spotlight." });
}
