import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await req.json();
    const updated = serverDb.updateUserRole(params.id, body.role);
    if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update user role" }, { status: 400 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  return PATCH(req, props);
}
