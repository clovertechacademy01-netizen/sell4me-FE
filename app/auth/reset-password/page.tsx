"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth-shell";
import { Button, Field, Input, Spinner } from "@/components/ui";
import { getErrorMessage } from "@/lib/axios";
import { useResetPasswordMutation } from "@/store/api/sell4meApi";

function ResetInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [form, setForm] = useState({
    email: params.get("email") || "",
    otp: "",
    new_password: "",
  });

  return (
    <AuthShell
      title="Choose a new password"
      description="Use the OTP from your email, then set a strong new password."
      footer={
        <Link href="/auth/login" className="font-medium text-brand hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await resetPassword(form).unwrap();
            toast.success("Password updated");
            router.push("/auth/login");
          } catch (err) {
            toast.error(getErrorMessage(err, "Reset failed"));
          }
        }}
      >
        <Field label="Email">
          <Input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="OTP">
          <Input
            required
            value={form.otp}
            onChange={(e) => setForm({ ...form, otp: e.target.value })}
          />
        </Field>
        <Field label="New password">
          <Input
            type="password"
            required
            value={form.new_password}
            onChange={(e) =>
              setForm({ ...form, new_password: e.target.value })
            }
          />
        </Field>
        <Button className="w-full" disabled={isLoading}>
          {isLoading ? "Updating…" : "Update password"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner className="size-8" />
        </div>
      }
    >
      <ResetInner />
    </Suspense>
  );
}
