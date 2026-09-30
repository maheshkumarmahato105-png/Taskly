import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  let tasks = serverDb.getTasks();

  if (status) {
    tasks = tasks.filter(t => t.status.toLowerCase() === status.toLowerCase());
  }
  if (category) {
    tasks = tasks.filter(t => t.category.toLowerCase() === category.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    tasks = tasks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({ items: tasks, total: tasks.length });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const task = serverDb.createTask(body);
    return NextResponse.json(task, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid task payload" }, { status: 400 });
  }
}
