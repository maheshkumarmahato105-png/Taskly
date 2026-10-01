import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await req.json();
    const updated = serverDb.updateStatus(params.id, body);
    if (!updated) return NextResponse.json({ error: "Status not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update status" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const ok = serverDb.deleteStatus(params.id);
  if (!ok) return NextResponse.json({ error: "Status not found" }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
