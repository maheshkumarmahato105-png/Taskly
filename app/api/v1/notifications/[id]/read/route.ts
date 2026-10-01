import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

export async function PATCH(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const ok = serverDb.markNotificationRead(params.id);
  if (!ok) return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
