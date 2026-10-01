import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

export async function GET() {
  const items = serverDb.getCategories();
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = serverDb.createCategory(body);
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create category" }, { status: 400 });
  }
}
