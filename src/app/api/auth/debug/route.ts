import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const checks: Record<string, unknown> = {};

  checks.NEXTAUTH_SECRET = !!process.env.NEXTAUTH_SECRET;
  checks.AUTH_SECRET = !!process.env.AUTH_SECRET;
  checks.NEXTAUTH_URL = process.env.NEXTAUTH_URL ?? "(not set)";
  checks.AUTH_URL = process.env.AUTH_URL ?? "(not set)";
  checks.AUTH_TRUST_HOST = process.env.AUTH_TRUST_HOST ?? "(not set)";
  checks.NODE_ENV = process.env.NODE_ENV;

  try {
    const userCount = await prisma.user.count();
    checks.database = { connected: true, userCount };
  } catch (err) {
    checks.database = {
      connected: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  return NextResponse.json(checks);
}
