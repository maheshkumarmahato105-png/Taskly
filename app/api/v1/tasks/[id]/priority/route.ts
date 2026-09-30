import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";
import type { TaskPriority } from "@/types/task";

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { priority, priorityId } = await req.json();
    const updated = serverDb.updateTask(params.id, { priority: (priority || priorityId) as TaskPriority });
    if (!updated) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid priority update" }, { status: 400 });
  }
}
