"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth-shell";
import { Button, Field, Input, Spinner } from "@/components/ui";
import { getErrorMessage } from "@/lib/axios";
import {
  useResendOtpMutation,
  useVerifyEmailMutation,
} from "@/store/api/sell4meApi";

function VerifyInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [resendOtp] = useResendOtpMutation();
  const [form, setForm] = useState({
    email: params.get("email") || "",
    otp: "",
  });

  return (
    <AuthShell
      title="Verify Your Email"
      description="Enter the 6-digit code we sent to your inbox."
      footer={
        <Link href="/auth/login" className="font-medium text-accent hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await verifyEmail(form).unwrap();
            toast.success("Email verified — you can sign in");
            router.push("/auth/login");
          } catch (err) {
            toast.error(getErrorMessage(err, "Invalid code"));
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
            inputMode="numeric"
            maxLength={6}
            value={form.otp}
            onChange={(e) => setForm({ ...form, otp: e.target.value })}
          />
        </Field>
        <Button className="w-full" disabled={isLoading}>
          {isLoading ? "Verifying…" : "Verify email"}
        </Button>
      </form>
      <button
        type="button"
        className="mt-4 w-full text-sm font-medium text-accent hover:underline"
        onClick={async () => {
          try {
            await resendOtp({ email: form.email }).unwrap();
            toast.success("OTP resent");
          } catch (err) {
            toast.error(getErrorMessage(err, "Could not resend"));
          }
        }}
      >
        Resend code
      </button>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner className="size-8" />
        </div>
      }
    >
      <VerifyInner />
    </Suspense>
  );
}
