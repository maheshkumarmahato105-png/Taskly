import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

export async function PATCH(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const updated = serverDb.toggleWidget(params.id);
  if (!updated) return NextResponse.json({ error: "Widget not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await req.json();
    const updated = serverDb.updateWidget(params.id, body);
    if (!updated) return NextResponse.json({ error: "Widget not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update widget" }, { status: 400 });
  }
}
