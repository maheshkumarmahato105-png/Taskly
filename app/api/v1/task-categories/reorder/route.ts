import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const items = body.items || body.categories || [];
    serverDb.reorderCategories(items);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to reorder categories" }, { status: 400 });
  }
}

export async function POST(req: Request) {
  return PUT(req);
}
