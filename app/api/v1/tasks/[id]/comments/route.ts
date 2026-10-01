import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const task = serverDb.getTaskById(params.id);
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  return NextResponse.json({ items: task.comments || [] });
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { text, author } = await req.json();
    const comment = serverDb.addComment(params.id, text, author);
    if (!comment) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    return NextResponse.json(comment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid comment payload" }, { status: 400 });
  }
}
