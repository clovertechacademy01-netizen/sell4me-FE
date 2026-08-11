"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth-shell";
import { PasswordInput } from "@/components/password-input";
import { Select } from "@/components/select";
import { Button, Field, Input, Spinner } from "@/components/ui";
import { getErrorMessage } from "@/lib/axios";
import { NIGERIAN_STATES } from "@/lib/utils";
import { useRegisterMutation } from "@/store/api/sell4meApi";

function RegisterInner() {
  const router = useRouter();
  const params = useSearchParams();
  const initialRole =
    params.get("role") === "partner" ? "partner" : "merchant";
  const [register, { isLoading }] = useRegisterMutation();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone_number: "",
    state: "Lagos",
    role: initialRole as "merchant" | "partner",
  });

  const roleCopy = useMemo(
    () =>
      form.role === "partner"
        ? "Share affiliate links and earn commission on delivered orders."
        : "List products, fulfil orders, and withdraw earnings to your bank.",
    [form.role],
  );

  return (
    <AuthShell
      wide
      title="Create Your Account"
      description={roleCopy}
      footer={
        <>
          Already registered?{" "}
          <Link href="/auth/login" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await register(form).unwrap();
            toast.success("Account created — verify your email");
            router.push(
              `/auth/verify-email?email=${encodeURIComponent(form.email)}`,
            );
          } catch (err) {
            toast.error(getErrorMessage(err, "Registration failed"));
          }
        }}
      >
        <div className="sm:col-span-2">
          <Field label="I want to">
            <Select
              value={form.role}
              onChange={(e) =>
                setForm({
                  ...form,
                  role: e.target.value as "merchant" | "partner",
                })
              }
            >
              <option value="merchant">Sell as a merchant</option>
              <option value="partner">Earn as a partner</option>
            </Select>
          </Field>
        </div>
        <Field label="First name">
          <Input
            required
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          />
        </Field>
        <Field label="Last name">
          <Input
            required
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Email">
            <Input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field
            label="Password"
            hint="8–15 chars with upper, lower, number, and special @$!%*?&"
          >
            <PasswordInput
              required
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Phone">
          <Input
            value={form.phone_number}
            placeholder="08012345678"
            onChange={(e) =>
              setForm({ ...form, phone_number: e.target.value })
            }
          />
        </Field>
        <Field label="State" hint="Needed for delivery quoting">
          <Select
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
          >
            {NIGERIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </Select>
        </Field>
        <div className="sm:col-span-2">
          <Button className="w-full" disabled={isLoading}>
            {isLoading ? "Creating…" : "Create account"}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner className="size-8" />
        </div>
      }
    >
      <RegisterInner />
    </Suspense>
  );
}
