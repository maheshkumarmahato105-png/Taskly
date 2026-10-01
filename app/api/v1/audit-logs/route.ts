import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const logs = serverDb.getAuditLogs(limit);
  return NextResponse.json({ items: logs });
}
