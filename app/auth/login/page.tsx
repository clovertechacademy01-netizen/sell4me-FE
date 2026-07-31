"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth-shell";
import { Button, Field, Input, Spinner } from "@/components/ui";
import { getErrorMessage } from "@/lib/axios";
import { useLoginMutation } from "@/store/api/sell4meApi";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [login, { isLoading }] = useLoginMutation();
  const [form, setForm] = useState({ email: "", password: "" });

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to your merchant or partner dashboard."
      footer={
        <>
          New here?{" "}
          <Link href="/auth/register" className="font-medium text-brand hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const res = await login(form).unwrap();
            toast.success("Signed in");
            const next = params.get("next");
            if (next) {
              router.replace(next);
              return;
            }
            if (res.user.role === "partner") router.replace("/partner");
            else if (res.user.role === "admin") router.replace("/merchant");
            else router.replace("/merchant");
          } catch (err) {
            toast.error(getErrorMessage(err, "Login failed"));
          }
        }}
      >
        <Field label="Email">
          <Input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            required
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </Field>
        <div className="flex justify-end">
          <Link href="/auth/forgot-password" className="text-sm font-medium text-brand hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner className="size-8" />
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
