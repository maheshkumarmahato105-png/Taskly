import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

export async function PATCH(_req: Request, props: { params: Promise<{ id: string; cid: string }> }) {
  const params = await props.params;
  const item = serverDb.toggleChecklist(params.id, params.cid);
  if (!item) return NextResponse.json({ error: "Checklist item not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function DELETE(_req: Request, props: { params: Promise<{ id: string; cid: string }> }) {
  const params = await props.params;
  const ok = serverDb.deleteChecklist(params.id, params.cid);
  if (!ok) return NextResponse.json({ error: "Checklist item not found" }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
