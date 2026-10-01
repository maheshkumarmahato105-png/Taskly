import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

export async function GET() {
  const roles = serverDb.getRoles();
  return NextResponse.json({ items: roles });
}
