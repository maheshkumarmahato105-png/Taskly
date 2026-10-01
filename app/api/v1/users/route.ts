import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

export async function GET() {
  const users = serverDb.getUsers();
  return NextResponse.json({ items: users });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = serverDb.createUser(body);
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create user" }, { status: 400 });
  }
}
