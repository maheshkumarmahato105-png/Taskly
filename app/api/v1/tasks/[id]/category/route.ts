import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { category, categoryId } = await req.json();
    const updated = serverDb.updateTask(params.id, { category: category || categoryId });
    if (!updated) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid category update" }, { status: 400 });
  }
}
