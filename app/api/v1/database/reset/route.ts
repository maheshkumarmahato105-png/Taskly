import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

export async function POST() {
  serverDb.resetDatabase();
  return NextResponse.json({
    success: true,
    message: "Database state restored to original demo seed",
  });
}
