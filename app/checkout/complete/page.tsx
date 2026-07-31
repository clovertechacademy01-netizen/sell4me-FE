"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { FadeIn } from "@/components/motion";
import { Button, Spinner } from "@/components/ui";

function CompleteInner() {
  const params = useSearchParams();
  const status = params.get("status") || params.get("payment_status");
  const txRef = params.get("tx_ref") || params.get("txRef") || "";
  const failed =
    status === "failed" || status === "cancelled" || status === "abandoned";

  return (
    <div className="container-page py-16">
      <FadeIn className="surface-card mx-auto max-w-lg p-8 text-center">
        <div
          className={`mx-auto grid size-14 place-items-center rounded-2xl ${failed ? "bg-red-50 text-danger" : "bg-brand-soft text-brand"}`}
        >
          {failed ? (
            <CircleAlert className="size-7" />
          ) : (
            <CheckCircle2 className="size-7" />
          )}
        </div>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-semibold">
          {failed ? "Payment not completed" : "Thanks — order received"}
        </h1>
        <p className="mt-3 text-sm text-muted">
          {failed
            ? "You can retry from the payment link in your checkout email."
            : "We’re confirming payment. Check your email for the tracking link — WhatsApp follows once payment succeeds."}
        </p>
        {txRef ? (
          <p className="mt-4 rounded-xl bg-surface-soft px-3 py-2 text-xs text-muted">
            Reference: {txRef}
          </p>
        ) : null}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/track-delivery">
            <Button>Track delivery</Button>
          </Link>
          <Link href="/">
            <Button variant="secondary">Back home</Button>
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}

export default function CheckoutCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="container-page flex min-h-[40vh] items-center justify-center">
          <Spinner className="size-8" />
        </div>
      }
    >
      <CompleteInner />
    </Suspense>
  );
}
