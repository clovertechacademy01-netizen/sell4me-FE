"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FadeIn } from "@/components/motion";
import { Button, EmptyState, Field, Input, Spinner } from "@/components/ui";
import { getErrorMessage } from "@/lib/axios";
import { formatNaira, NIGERIAN_STATES } from "@/lib/utils";
import {
  useCheckoutMutation,
  useEstimateDeliveryMutation,
  useGetCartQuery,
} from "@/store/api/sell4meApi";
import { useAppSelector } from "@/store/hooks";
import { Select } from "@/components/select";

export default function CheckoutPage() {
  useGetCartQuery();
  const cart = useAppSelector((s) => s.cart.cart);
  const [checkout, { isLoading }] = useCheckoutMutation();
  const [estimateDelivery] = useEstimateDeliveryMutation();
  const [estimating, setEstimating] = useState(false);
  const [deliveryTotal, setDeliveryTotal] = useState<number | null>(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    recipient_phone: "",
    recipient_address: "",
    recipient_state: "Lagos",
    city: "",
    country: "Nigeria",
  });

  const storeGroups = useMemo(() => {
    const map = new Map<string, number>();
    cart?.items.forEach((item) => {
      const current = map.get(item.store_id) || 0;
      map.set(item.store_id, current + item.line_total + item.line_commission);
    });
    return Array.from(map.entries());
  }, [cart]);

  useEffect(() => {
    if (!cart?.items?.length || !form.recipient_state) {
      setDeliveryTotal(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setEstimating(true);
      try {
        const fees = await Promise.all(
          storeGroups.map(([store_id, value_of_items]) =>
            estimateDelivery({
              store_id,
              recipient_state: form.recipient_state,
              value_of_items,
            }).unwrap(),
          ),
        );
        if (!cancelled) {
          setDeliveryTotal(
            fees.reduce((sum, fee) => sum + Number(fee.delivery_fee || 0), 0),
          );
        }
      } catch {
        if (!cancelled) setDeliveryTotal(null);
      } finally {
        if (!cancelled) setEstimating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cart?.items?.length, form.recipient_state, storeGroups, estimateDelivery]);

  if (!cart) {
    return (
      <div className="container-page flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!cart.items.length) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Nothing to checkout"
          description="Add products to your cart first."
          action={
            <Link href="/">
              <Button>Go home</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const grand =
    cart.total + (deliveryTotal !== null ? deliveryTotal : 0);

  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[1.2fr_0.8fr]">
      <FadeIn className="surface-card p-6 sm:p-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Checkout
        </h1>
        <p className="mt-2 text-sm text-muted">
          No account needed — we create a lightweight customer record from your email.
        </p>

        <form
          className="mt-8 grid gap-4 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const redirect_url = `${window.location.origin}/checkout/complete`;
              const res = await checkout({
                ...form,
                redirect_url,
              }).unwrap();
              const link =
                res.payment?.flutterwave?.data?.link ||
                (res.payment?.flutterwave as { link?: string } | undefined)?.link;
              if (link) {
                window.location.href = link;
                return;
              }
              toast.success(res.message || "Order created");
              window.location.href = `/checkout/complete?tx_ref=${res.payment?.payment?.tx_ref || ""}`;
            } catch (err) {
              toast.error(getErrorMessage(err, "Checkout failed"));
            }
          }}
        >
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
          <Field label="Email">
            <Input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label="Phone">
            <Input
              required
              value={form.recipient_phone}
              placeholder="08012345678"
              onChange={(e) =>
                setForm({ ...form, recipient_phone: e.target.value })
              }
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Delivery address">
              <Input
                required
                value={form.recipient_address}
                onChange={(e) =>
                  setForm({ ...form, recipient_address: e.target.value })
                }
              />
            </Field>
          </div>
          <Field label="State">
            <Select
              required
              value={form.recipient_state}
              onChange={(e) =>
                setForm({ ...form, recipient_state: e.target.value })
              }
            >
              {NIGERIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="City">
            <Input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </Field>
          <div className="sm:col-span-2 mt-2">
            <Button className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Placing order…" : "Pay with Flutterwave"}
            </Button>
          </div>
        </form>
      </FadeIn>

      <FadeIn delay={0.08} className="surface-card h-fit p-6 lg:sticky lg:top-24">
        <h2 className="font-semibold">Order total</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Items</dt>
            <dd>{formatNaira(cart.total)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Delivery estimate</dt>
            <dd>
              {estimating
                ? "…"
                : deliveryTotal !== null
                  ? formatNaira(deliveryTotal)
                  : "—"}
            </dd>
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
            <dt>Grand total</dt>
            <dd className="text-brand">{formatNaira(grand)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-muted">
          One order is created per store in your cart. You’ll receive email with payment
          and tracking links.
        </p>
      </FadeIn>
    </div>
  );
}
