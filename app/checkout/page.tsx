"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { InfoTip } from "@/components/info-tip";
import { FadeIn } from "@/components/motion";
import { Select } from "@/components/select";
import { Button, EmptyState, Field, Input, Spinner } from "@/components/ui";
import { getErrorMessage } from "@/lib/axios";
import type { DeliveryEstimate, DeliveryMethod } from "@/lib/types";
import { cn, formatNaira, NIGERIAN_STATES } from "@/lib/utils";
import {
  useCheckoutMutation,
  useEstimateDeliveryMutation,
  useGetCartQuery,
  useLazyCheckPublicLockerAvailabilityQuery,
  useListPublicLockersQuery,
} from "@/store/api/sell4meApi";
import { useAppSelector } from "@/store/hooks";

const DELIVERY_OPTIONS: Array<{
  id: DeliveryMethod;
  title: string;
  summary: string;
  detail: string;
}> = [
  {
    id: "home",
    title: "Direct delivery",
    summary: "Delivered to your address",
    detail:
      "Your order is delivered straight to the address you provide. You’ll need to be available to receive it, and pricing is based on door-to-door Fez delivery for each store in your cart.",
  },
  {
    id: "locker",
    title: "Locker pickup",
    summary: "Collect from a Fez smart locker",
    detail:
      "Your order is sent to a Fez smart locker you choose. After delivery you’ll pick it up with a code. Locker pricing can differ from door delivery, and the locker address is used instead of your home address.",
  },
];

export default function CheckoutPage() {
  useGetCartQuery();
  const cart = useAppSelector((s) => s.cart.cart);
  const [checkout, { isLoading }] = useCheckoutMutation();
  const [estimateDelivery] = useEstimateDeliveryMutation();
  const [checkLockerAvailability] = useLazyCheckPublicLockerAvailabilityQuery();
  const [estimating, setEstimating] = useState(false);
  const [estimates, setEstimates] = useState<DeliveryEstimate[]>([]);
  const [checkingLocker, setCheckingLocker] = useState(false);
  const [lockerAvailable, setLockerAvailable] = useState<boolean | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("home");
  const [lockerId, setLockerId] = useState("");
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

  const useLocker = deliveryMethod === "locker";

  const {
    data: lockersData,
    isFetching: loadingLockers,
    error: lockersError,
  } = useListPublicLockersQuery(form.recipient_state, {
    skip: !useLocker || !form.recipient_state,
  });

  const lockers = lockersData?.items || [];
  const selectedLocker = lockers.find((locker) => locker.id === lockerId);

  const storeGroups = useMemo(() => {
    const map = new Map<string, number>();
    cart?.items.forEach((item) => {
      const current = map.get(item.store_id) || 0;
      map.set(item.store_id, current + Number(item.line_total || 0));
    });
    return Array.from(map.entries());
  }, [cart]);

  useEffect(() => {
    setLockerId("");
    setLockerAvailable(null);
  }, [form.recipient_state, deliveryMethod]);

  useEffect(() => {
    if (!useLocker || !lockerId) {
      setLockerAvailable(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setCheckingLocker(true);
      try {
        const res = await checkLockerAvailability(lockerId).unwrap();
        if (!cancelled) setLockerAvailable(res.available);
      } catch {
        if (!cancelled) setLockerAvailable(null);
      } finally {
        if (!cancelled) setCheckingLocker(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [useLocker, lockerId, checkLockerAvailability]);

  useEffect(() => {
    if (!cart?.items?.length || !form.recipient_state) {
      setEstimates([]);
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
              locker: useLocker,
            }).unwrap(),
          ),
        );
        if (!cancelled) setEstimates(fees);
      } catch {
        if (!cancelled) setEstimates([]);
      } finally {
        if (!cancelled) setEstimating(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    cart?.items?.length,
    form.recipient_state,
    storeGroups,
    estimateDelivery,
    useLocker,
  ]);

  const deliveryTotal = estimates.length
    ? estimates.reduce((sum, fee) => sum + Number(fee.delivery_fee || 0), 0)
    : null;
  const fezTotal = estimates.length
    ? estimates.reduce((sum, fee) => sum + Number(fee.fez_cost || 0), 0)
    : null;
  const markupTotal = estimates.length
    ? estimates.reduce((sum, fee) => sum + Number(fee.markup || 0), 0)
    : null;

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
          title="Nothing To Checkout"
          description="Add products to your cart first."
          action={
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const grand = cart.total + (deliveryTotal !== null ? deliveryTotal : 0);
  const methodMeta = DELIVERY_OPTIONS.find((option) => option.id === deliveryMethod);

  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[1.2fr_0.8fr]">
      <FadeIn className="surface-card p-6 sm:p-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Checkout
        </h1>
        <p className="mt-2 text-sm text-muted">
          No account needed — we create a lightweight customer record from your
          email.
        </p>

        <form
          className="mt-8 grid gap-4 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();

            if (useLocker) {
              if (!lockerId) {
                toast.error("Select a Fez locker for pickup");
                return;
              }
              if (lockerAvailable === false) {
                toast.error("Selected locker is not available. Choose another.");
                return;
              }
            } else if (!form.recipient_address.trim()) {
              toast.error("Enter your delivery address");
              return;
            }

            try {
              const redirect_url = `${window.location.origin}/checkout/complete`;
              const res = await checkout({
                first_name: form.first_name,
                last_name: form.last_name,
                email: form.email,
                recipient_phone: form.recipient_phone,
                recipient_state: form.recipient_state,
                city: form.city || undefined,
                country: form.country || undefined,
                delivery_method: deliveryMethod,
                ...(useLocker
                  ? { locker_id: lockerId }
                  : { recipient_address: form.recipient_address }),
                redirect_url,
              }).unwrap();
              const trackingCode =
                res.payment?.payment?.tracking_code ||
                res.tracking_code ||
                res.orders?.[0]?.tracking_code ||
                "";
              const txRef =
                res.payment?.payment?.tx_ref || res.payment_tx_ref || "";
              try {
                if (trackingCode) {
                  sessionStorage.setItem(
                    "sell4me_tracking_code",
                    trackingCode,
                  );
                }
                if (txRef) {
                  sessionStorage.setItem("sell4me_tx_ref", txRef);
                }
              } catch {
                /* ignore private mode */
              }
              const link =
                res.payment?.flutterwave?.data?.link ||
                (res.payment?.flutterwave as { link?: string } | undefined)
                  ?.link;
              if (link) {
                window.location.href = link;
                return;
              }
              toast.success(res.message || "Order created");
              const q = new URLSearchParams();
              if (txRef) q.set("tx_ref", txRef);
              if (trackingCode) q.set("tracking_code", trackingCode);
              window.location.href = `/checkout/complete?${q.toString()}`;
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

          <div className="sm:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Delivery method</p>
              <InfoTip label="About delivery methods">
                Choose how you want to receive your order. Pricing updates based
                on direct door delivery or Fez locker pickup.
              </InfoTip>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {DELIVERY_OPTIONS.map((option) => {
                const selected = deliveryMethod === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setDeliveryMethod(option.id)}
                    className={cn(
                      "rounded-xl border p-4 text-left transition",
                      selected
                        ? "border-accent bg-accent-soft/50 shadow-[0_0_0_1px_rgba(255,122,69,0.35)]"
                        : "border-border bg-white hover:border-accent/40",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{option.title}</p>
                        <p className="mt-1 text-xs text-muted">{option.summary}</p>
                      </div>
                      <InfoTip label={`About ${option.title}`}>
                        {option.detail}
                      </InfoTip>
                    </div>
                  </button>
                );
              })}
            </div>
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

          {useLocker ? (
            <div className="sm:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Fez locker</p>
                <InfoTip label="About locker pickup">
                  Pick a locker in your state. Your parcel is delivered there
                  for self-collection. Availability is checked when you select
                  one.
                </InfoTip>
              </div>
              {loadingLockers ? (
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Spinner className="size-4" />
                  Loading lockers…
                </div>
              ) : lockersError ? (
                <p className="text-sm text-danger">
                  {getErrorMessage(lockersError, "Could not load lockers")}
                </p>
              ) : (
                <Select
                  required
                  value={lockerId}
                  placeholder="Select a locker"
                  options={lockers.map((locker) => ({
                    value: locker.id,
                    label: locker.address,
                    description: `Locker ID · ${locker.id}`,
                  }))}
                  onChange={(e) => setLockerId(e.target.value)}
                />
              )}
              {selectedLocker ? (
                <div className="rounded-xl border border-border bg-surface-soft p-3 text-sm">
                  <p className="font-medium">Pickup address</p>
                  <p className="mt-1 text-muted">{selectedLocker.address}</p>
                  <p className="mt-2 text-xs text-muted">
                    {checkingLocker
                      ? "Checking availability…"
                      : lockerAvailable === true
                        ? "This locker is available."
                        : lockerAvailable === false
                          ? "This locker is currently unavailable."
                          : "Availability unknown."}
                  </p>
                  {lockersData?.max_weight != null ||
                  lockersData?.max_value_of_item != null ? (
                    <p className="mt-2 text-xs text-muted">
                      {lockersData.max_weight != null
                        ? `Max weight ${lockersData.max_weight}kg`
                        : null}
                      {lockersData.max_weight != null &&
                      lockersData.max_value_of_item != null
                        ? " · "
                        : null}
                      {lockersData.max_value_of_item != null
                        ? `Max item value ${formatNaira(lockersData.max_value_of_item)}`
                        : null}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="sm:col-span-2">
              <div className="mb-1.5 flex items-center gap-2">
                <LabelLike>Delivery address</LabelLike>
                <InfoTip label="About delivery address">
                  Enter the full street address where the courier should deliver
                  your order for direct delivery.
                </InfoTip>
              </div>
              <Input
                required
                value={form.recipient_address}
                onChange={(e) =>
                  setForm({ ...form, recipient_address: e.target.value })
                }
              />
            </div>
          )}

          <div className="sm:col-span-2 mt-2">
            <Button
              className="w-full"
              size="lg"
              variant="accent"
              disabled={
                isLoading ||
                (useLocker && (!lockerId || lockerAvailable === false))
              }
            >
              {isLoading ? "Placing Order…" : "Pay With Flutterwave"}
            </Button>
          </div>
        </form>
      </FadeIn>

      <FadeIn delay={0.08} className="surface-card h-fit p-6 lg:sticky lg:top-24">
        <h2 className="font-semibold">Order total</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Items</dt>
            <dd>{formatNaira(cart.total)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="flex items-center gap-1.5 text-muted">
              Delivery
              <InfoTip label="Delivery pricing">
                {methodMeta?.detail ||
                  "Delivery fee is estimated from Fez cost plus platform markup for each store order."}
              </InfoTip>
            </dt>
            <dd className="text-right">
              <span className="block text-xs font-medium text-brand">
                {useLocker ? "Locker pickup" : "Direct delivery"}
              </span>
              {estimating
                ? "…"
                : deliveryTotal !== null
                  ? formatNaira(deliveryTotal)
                  : "—"}
            </dd>
          </div>
          {deliveryTotal !== null && !estimating ? (
            <>
              <div className="flex justify-between gap-3 text-xs">
                <dt className="text-muted">Courier (Fez)</dt>
                <dd>{formatNaira(fezTotal || 0)}</dd>
              </div>
              <div className="flex justify-between gap-3 text-xs">
                <dt className="text-muted">Platform fee</dt>
                <dd>{formatNaira(markupTotal || 0)}</dd>
              </div>
            </>
          ) : null}
          {estimates.length > 1 ? (
            <div className="rounded-lg border border-border bg-surface-soft p-3 text-xs text-muted">
              {estimates.length} store deliveries in this checkout
              {useLocker ? " via locker pricing" : " via door delivery"}.
            </div>
          ) : null}
          <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
            <dt>Grand total</dt>
            <dd className="text-accent">{formatNaira(grand)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-muted">
          One order is created per store in your cart. You’ll receive email with
          payment and tracking links.
        </p>
      </FadeIn>
    </div>
  );
}

function LabelLike({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-sm font-medium tracking-[0.01em] text-foreground">
      {children}
    </span>
  );
}
