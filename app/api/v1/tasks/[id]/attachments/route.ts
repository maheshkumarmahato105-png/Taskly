import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const task = serverDb.getTaskById(params.id);
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  return NextResponse.json({ items: task.attachments || [] });
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await req.json();
    const item = serverDb.addAttachment(params.id, body);
    if (!item) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid attachment payload" }, { status: 400 });
  }
}
