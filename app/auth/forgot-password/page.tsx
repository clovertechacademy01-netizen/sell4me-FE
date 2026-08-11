"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth-shell";
import { Button, Field, Input } from "@/components/ui";
import { getErrorMessage } from "@/lib/axios";
import { useForgotPasswordMutation } from "@/store/api/sell4meApi";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  return (
    <AuthShell
      title="Reset Password"
      description="We’ll email a one-time code to reset your password."
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
            await forgotPassword({ email }).unwrap();
            toast.success("If that email exists, an OTP was sent");
            router.push(
              `/auth/reset-password?email=${encodeURIComponent(email)}`,
            );
          } catch (err) {
            toast.error(getErrorMessage(err, "Request failed"));
          }
        }}
      >
        <Field label="Email">
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Button className="w-full" disabled={isLoading}>
          {isLoading ? "Sending…" : "Send reset code"}
        </Button>
      </form>
    </AuthShell>
  );
}
