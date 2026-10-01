import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

export async function GET() {
  const items = serverDb.getNotifications();
  return NextResponse.json({ items });
}

export async function POST() {
  serverDb.markAllNotificationsRead();
  return NextResponse.json({ success: true });
}
