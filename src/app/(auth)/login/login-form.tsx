"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginSchema } from "@/lib/validations/auth";
import type { z } from "zod";

type LoginValues = z.infer<typeof loginSchema>;

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
    console.log("[LOGIN] Submitting login for:", data.email);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: "/",
      });

      console.log("[LOGIN] signIn result:", JSON.stringify(result, null, 2));

      if (result?.error) {
        console.error("[LOGIN] signIn error:", result.error, "status:", result.status, "url:", result.url);
        setError(`Login failed: ${result.error} (status: ${result.status})`);
      } else if (result?.url) {
        console.log("[LOGIN] Redirecting to:", result.url);
        window.location.href = result.url;
      } else {
        console.error("[LOGIN] No error but no URL either:", result);
        setError("Unexpected response from server");
      }
    } catch (err) {
      console.error("[LOGIN] Exception during signIn:", err);
      setError(`Exception: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return (
    <div className="w-full max-w-[400px] rounded-[14px] bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
      <h1 className="mb-6 text-center text-[28px] font-bold text-[#007AFF]">
        HR Curie
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <input
          {...register("email")}
          type="email"
          placeholder="Email"
          autoComplete="email"
          className="h-[44px] rounded-[8px] bg-[rgba(120,120,128,0.12)] px-3 text-[17px] outline-none placeholder:text-[rgba(60,60,67,0.3)] focus:ring-2 focus:ring-[#007AFF]/40"
        />

        <div className="relative">
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            autoComplete="current-password"
            className="h-[44px] w-full rounded-[8px] bg-[rgba(120,120,128,0.12)] px-3 pr-10 text-[17px] outline-none placeholder:text-[rgba(60,60,67,0.3)] focus:ring-2 focus:ring-[#007AFF]/40"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(60,60,67,0.6)] hover:text-[rgba(60,60,67,0.8)]"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-[44px] w-full rounded-[8px] bg-[#007AFF] text-[17px] font-semibold text-white transition-all duration-150 [transition-timing-function:cubic-bezier(0.25,0.1,0.25,1)] hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 className="mx-auto size-5 animate-spin" />
          ) : (
            "Sign In"
          )}
        </button>

        {error && (
          <p className="mt-2 text-[13px] text-[#FF3B30]">{error}</p>
        )}
      </form>
    </div>
  );
}
