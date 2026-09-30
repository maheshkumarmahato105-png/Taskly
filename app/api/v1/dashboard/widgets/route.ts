import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

export async function GET() {
  const items = serverDb.getWidgets();
  return NextResponse.json({ items, total: items.length });
}
