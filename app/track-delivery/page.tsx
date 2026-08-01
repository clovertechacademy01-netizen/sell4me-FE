"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { FadeIn } from "@/components/motion";
import { StatusBadge } from "@/components/product-card";
import { Button, Field, Input, Spinner } from "@/components/ui";
import { getErrorMessage } from "@/lib/axios";
import type { TrackingOrder } from "@/lib/types";
import { formatNaira } from "@/lib/utils";
import {
  useTrackByLookupMutation,
  useTrackByTokenQuery,
} from "@/store/api/sell4meApi";

function TrackInner() {
  const params = useSearchParams();
  const token = params.get("token");
  const {
    data: tokenData,
    isLoading: tokenLoading,
    error: tokenError,
  } = useTrackByTokenQuery(token || "", { skip: !token });
  const [trackByLookup, { isLoading: lookupLoading }] =
    useTrackByLookupMutation();
  const [orders, setOrders] = useState<TrackingOrder[]>([]);
  const [form, setForm] = useState({
    email: "",
    order_id: "",
    payment_tx_ref: "",
  });

  useEffect(() => {
    if (tokenData?.orders) setOrders(tokenData.orders);
  }, [tokenData]);

  useEffect(() => {
    if (tokenError) {
      toast.error(getErrorMessage(tokenError, "Invalid tracking link"));
    }
  }, [tokenError]);

  const loading = Boolean(token) ? tokenLoading : lookupLoading;

  return (
    <div className="container-page space-y-8 py-10">
      <FadeIn>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Track delivery
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Use the secure link from your checkout email, or look up with email plus order
          ID or payment reference.
        </p>
      </FadeIn>

      {!token ? (
        <FadeIn className="surface-card max-w-xl p-6">
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await trackByLookup({
                  email: form.email,
                  order_id: form.order_id || undefined,
                  payment_tx_ref: form.payment_tx_ref || undefined,
                }).unwrap();
                setOrders(res.orders || []);
                if (!res.orders?.length) toast.message("No orders found");
              } catch (err) {
                toast.error(getErrorMessage(err, "Lookup failed"));
              }
            }}
          >
            <Field label="Email">
              <Input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
            <Field label="Order ID" hint="Optional if you have payment reference">
              <Input
                value={form.order_id}
                onChange={(e) => setForm({ ...form, order_id: e.target.value })}
              />
            </Field>
            <Field label="Payment reference" hint="Optional if you have order ID">
              <Input
                value={form.payment_tx_ref}
                onChange={(e) =>
                  setForm({ ...form, payment_tx_ref: e.target.value })
                }
              />
            </Field>
            <Button disabled={loading}>{loading ? "Searching…" : "Look up"}</Button>
          </form>
        </FadeIn>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner className="size-8" />
        </div>
      ) : orders.length ? (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="surface-card p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{order.store_name}</h2>
                  <p className="mt-1 text-xs text-muted">Order {order.id}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={order.status} />
                  <StatusBadge status={order.payment_status} />
                  {order.delivery_status ? (
                    <StatusBadge status={order.delivery_status} />
                  ) : null}
                </div>
              </div>
              <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-muted">Items</dt>
                  <dd className="font-medium">{formatNaira(order.order_cost)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Delivery</dt>
                  <dd className="font-medium">
                    {formatNaira(order.delivery_fee)}
                    <span className="mt-0.5 block text-xs font-normal text-muted">
                      {order.delivery_method === "locker"
                        ? "Locker pickup"
                        : "Direct delivery"}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Total</dt>
                  <dd className="font-medium text-brand">
                    {formatNaira(order.total)}
                  </dd>
                </div>
              </dl>
              {order.delivery_method === "locker" && order.locker_address ? (
                <p className="mt-3 text-sm text-muted">
                  Pickup · {order.locker_address}
                  {order.locker_id ? ` (${order.locker_id})` : ""}
                </p>
              ) : null}
              {(order.waybill_number || order.fez_order_no) && (
                <p className="mt-3 text-xs text-muted">
                  {order.waybill_number
                    ? `Waybill ${order.waybill_number}`
                    : `Fez ${order.fez_order_no}`}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function TrackDeliveryPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page flex min-h-[40vh] items-center justify-center">
          <Spinner className="size-8" />
        </div>
      }
    >
      <TrackInner />
    </Suspense>
  );
}
