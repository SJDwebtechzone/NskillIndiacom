import { NextRequest, NextResponse } from "next/server";

const EXPRESS_BASE = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/api/course_events`;

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
const res = await fetch(`${EXPRESS_BASE}/${id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
    if (!res.ok) throw new Error(`Express error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
   console.error("[PUT]", err.message);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
   const res = await fetch(`${EXPRESS_BASE}/${id}`, {
  method: "DELETE",
});
    if (!res.ok) throw new Error(`Express error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
   console.error("[DELETE]", err.message);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}