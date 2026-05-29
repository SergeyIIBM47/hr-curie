"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginSchema } from "@/lib/validations/auth";
import { Btn } from "@/components/curie";
import { cn } from "@/lib/utils";
import type { z } from "zod";

type LoginValues = z.infer<typeof loginSchema>;

async function getCsrfToken(): Promise<string> {
  const res = await fetch("/api/auth/csrf");
  const data = await res.json();
  return data.csrfToken;
}

const FIELD_CLASS = cn(
  "h-11 w-full rounded-[var(--radius-curie-sm)] px-3.5",
  "bg-[var(--color-curie-surface)]",
  "border border-[var(--color-curie-border)]",
  "text-[15px] text-[var(--color-curie-fg)]",
  "placeholder:text-[var(--color-curie-fg-muted)]",
  "transition-colors outline-none",
  "focus:border-[var(--color-curie-brand)]",
  "focus:ring-2 focus:ring-[var(--color-curie-brand)]/20",
);

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginValues) {
    setError(null);

    try {
      const rateLimitRes = await fetch("/api/auth/rate-limit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      if (rateLimitRes.status === 429) {
        setError("Too many login attempts. Try again in 15 minutes.");
        return;
      }

      const csrfToken = await getCsrfToken();

      const res = await fetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          csrfToken,
          email: data.email,
          password: data.password,
          callbackUrl: "/",
        }),
        redirect: "manual",
      });

      if (res.status === 0 || res.type === "opaqueredirect") {
        window.location.assign("/");
        return;
      }

      if (res.ok) {
        const url = new URL(res.url);
        if (url.pathname.includes("/error") || url.searchParams.has("error")) {
          setError("Invalid email or password");
          return;
        }
        window.location.assign("/");
        return;
      }

      setError("Invalid email or password");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    }
  }

  return (
    <div
      className={cn(
        "w-full",
        "rounded-[var(--radius-curie-lg)]",
        "bg-[var(--color-curie-surface)]",
        "border border-[var(--color-curie-border)]",
        "p-8 shadow-[var(--shadow-curie-soft)]",
      )}
    >
      <div className="mb-8 flex flex-col items-center gap-2">
        <span
          aria-hidden="true"
          className={cn(
            "grid place-items-center size-11",
            "rounded-[var(--radius-curie-md)]",
            "bg-[var(--color-curie-brand)] text-[var(--color-curie-fg-on-brand)]",
            "font-[family-name:var(--font-curie-display)]",
            "text-[20px] font-medium leading-none",
          )}
        >
          C
        </span>
        <h1
          className={cn(
            "font-[family-name:var(--font-curie-display)]",
            "text-[26px] font-medium leading-tight tracking-[-0.015em]",
            "text-[var(--color-curie-fg)]",
          )}
        >
          HR Curie
        </h1>
        <p className="text-[13px] text-[var(--color-curie-fg-secondary)]">
          Sign in to continue
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <input
          {...register("email")}
          type="email"
          placeholder="Email"
          autoComplete="email"
          className={FIELD_CLASS}
        />

        <div className="relative">
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            autoComplete="current-password"
            className={cn(FIELD_CLASS, "pr-11")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2",
              "grid size-8 place-items-center",
              "rounded-[var(--radius-curie-sm)]",
              "text-[var(--color-curie-fg-secondary)]",
              "transition-colors hover:bg-[var(--color-curie-surface-sunken)]",
            )}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>

        <Btn
          type="submit"
          variant="primary"
          size="md"
          disabled={isSubmitting}
          className="mt-2 w-full"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            "Sign In"
          )}
        </Btn>

        {error ? (
          <p
            role="alert"
            className="mt-1 text-[13px] text-[var(--color-curie-danger)]"
          >
            {error}
          </p>
        ) : null}
      </form>
    </div>
  );
}
