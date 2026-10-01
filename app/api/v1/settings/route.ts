import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

export async function GET() {
  const settings = serverDb.getSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const updated = serverDb.updateSettings(body);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 400 });
  }
}
