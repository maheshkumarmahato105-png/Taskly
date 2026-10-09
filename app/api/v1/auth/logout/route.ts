import { NextResponse } from "next/server";

const GO_API_URL = process.env.GO_BACKEND_URL || (process.env.NODE_ENV === "development" ? "http://localhost:8080" : "");

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (GO_API_URL) {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (authHeader) headers["Authorization"] = authHeader;

      await fetch(`${GO_API_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(1500),
      });
    } catch {
      // Ignore error on logout
    }
  }
  return NextResponse.json({ success: true });
}
