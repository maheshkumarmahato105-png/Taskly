import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { dueDate } = await req.json();
    const updated = serverDb.updateTask(params.id, { dueDate });
    if (!updated) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid due date update" }, { status: 400 });
  }
}
