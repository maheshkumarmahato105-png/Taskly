import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const task = serverDb.getTaskById(params.id);
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  const allLogs = serverDb.getAuditLogs(10);
  return NextResponse.json({ items: allLogs });
}
