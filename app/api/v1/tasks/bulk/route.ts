import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

export async function POST(req: Request) {
  try {
    const { taskIds, action, status, priority, category } = await req.json();
    const value = status || priority || category;
    const ok = serverDb.bulkAction(taskIds, action, value);
    if (!ok) return NextResponse.json({ error: "Failed to perform bulk action" }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid bulk action payload" }, { status: 400 });
  }
}
