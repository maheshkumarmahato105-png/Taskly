import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await req.json();
    const updated = serverDb.updateCategory(params.id, body);
    if (!updated) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update category" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const ok = serverDb.deleteCategory(params.id);
  if (!ok) return NextResponse.json({ error: "Category not found" }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
