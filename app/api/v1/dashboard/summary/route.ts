import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

export async function GET() {
  const summary = serverDb.getSummary();
  return NextResponse.json(summary);
}
