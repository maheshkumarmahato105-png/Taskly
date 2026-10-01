import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

const GO_API_URL = process.env.GO_BACKEND_URL || "http://localhost:8080";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Try forwarding to Go REST API service
    try {
      const goRes = await fetch(`${GO_API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      });
      if (goRes.ok) {
        const data = await goRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Fallback to local serverDb if Go microservice is offline
    }

    const session = serverDb.login(body.email, body.password);
    return NextResponse.json(session);
  } catch (err: any) {
    return NextResponse.json({ error: "Invalid request", message: err.message }, { status: 400 });
  }
}
