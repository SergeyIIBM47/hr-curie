import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: Role;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      role: Role;
      name: string;
      image?: string;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[AUTH] authorize called with email:", (credentials as Record<string, unknown>)?.email);

        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          console.log("[AUTH] Zod validation failed:", parsed.error.flatten());
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: {
            employee: {
              select: { firstName: true, lastName: true, avatarUrl: true },
            },
          },
        });

        if (!user) {
          console.log("[AUTH] User not found for email:", parsed.data.email);
          return null;
        }

        console.log("[AUTH] User found, id:", user.id, "role:", user.role);

        const valid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        );
        if (!valid) {
          console.log("[AUTH] Invalid password for user:", user.id);
          return null;
        }

        console.log("[AUTH] Login successful for user:", user.id);
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.employee
            ? `${user.employee.firstName} ${user.employee.lastName}`
            : user.email,
          image: user.employee?.avatarUrl ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id!;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.userId as string;
      session.user.role = token.role as Role;
      return session;
    },
  },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
});
