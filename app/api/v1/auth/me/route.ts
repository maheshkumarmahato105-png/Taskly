import { NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

const GO_API_URL = process.env.GO_BACKEND_URL || (process.env.NODE_ENV === "development" ? "http://localhost:8080" : "");

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email") || undefined;
  const authHeader = req.headers.get("Authorization");

  if (GO_API_URL) {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (authHeader) headers["Authorization"] = authHeader;

      const query = email ? `?email=${encodeURIComponent(email)}` : "";
      const goRes = await fetch(`${GO_API_URL}/api/v1/auth/me${query}`, {
        method: "GET",
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(1500),
      });
      if (goRes.ok) {
        const data = await goRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Fallback
    }
  }

  const session = serverDb.login(email);
  return NextResponse.json(session);
}
