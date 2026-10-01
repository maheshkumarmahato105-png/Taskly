import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const ok = serverDb.deleteCustomField(params.id);
  if (!ok) return NextResponse.json({ error: "Custom field not found" }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
