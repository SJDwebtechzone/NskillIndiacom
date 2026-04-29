import { NextRequest, NextResponse } from "next/server";

const EXPRESS_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/course_events`
  : "http://localhost:5000/api/course_events";

export async function GET() {
  try {
    const res = await fetch(EXPRESS_BASE, { cache: "no-store" });
    if (!res.ok) throw new Error(`Express error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[GET /api/course_events]", err.message);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(EXPRESS_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Express error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/course_events]", err.message);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}