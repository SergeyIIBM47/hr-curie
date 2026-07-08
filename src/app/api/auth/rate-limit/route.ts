import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isLoginRateLimited } from "@/lib/rate-limit";

const checkSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = checkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  if (isLoginRateLimited(parsed.data.email)) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again in 15 minutes." },
      { status: 429 },
    );
  }

  return NextResponse.json({ ok: true });
}
