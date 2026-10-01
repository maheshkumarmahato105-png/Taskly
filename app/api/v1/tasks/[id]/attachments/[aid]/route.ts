import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

export async function DELETE(_req: Request, props: { params: Promise<{ id: string; aid: string }> }) {
  const params = await props.params;
  const ok = serverDb.deleteAttachment(params.id, params.aid);
  if (!ok) return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
