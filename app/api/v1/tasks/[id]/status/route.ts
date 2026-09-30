import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";
import type { TaskStatus } from "@/types/task";

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { status, statusId } = await req.json();
    const updated = serverDb.updateTask(params.id, { status: (status || statusId) as TaskStatus });
    if (!updated) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid status update" }, { status: 400 });
  }
}
