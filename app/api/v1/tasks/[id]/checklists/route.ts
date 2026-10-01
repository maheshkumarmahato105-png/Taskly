import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { text } = await req.json();
    const item = serverDb.addChecklist(params.id, text);
    if (!item) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid checklist payload" }, { status: 400 });
  }
}
