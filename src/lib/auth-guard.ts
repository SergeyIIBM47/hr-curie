import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import type { Role } from "@prisma/client";

export async function requireAuth(requiredRole?: Role) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (requiredRole && session.user.role !== requiredRole) redirect("/profile");
  return session;
}

type ApiAuthResult =
  | { error: NextResponse; session?: never }
  | { error?: never; session: Session };

export async function requireApiAuth(
  requiredRole?: Role,
): Promise<ApiAuthResult> {
  const session = await auth();
  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (requiredRole && session.user.role !== requiredRole) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { session };
}
