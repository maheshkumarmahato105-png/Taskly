import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

export async function GET() {
  const settings = serverDb.getSettings();
  return NextResponse.json(settings);
}
