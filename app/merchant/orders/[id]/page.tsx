"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatusBadge } from "@/components/product-card";
import { Button, Spinner } from "@/components/ui";
import { Select } from "@/components/select";
import { getErrorMessage } from "@/lib/axios";
import type { OrderStatus } from "@/lib/types";
import { formatNaira } from "@/lib/utils";
import {
  useGetOrderQuery,
  useTrackFezOrderQuery,
  useUpdateOrderStatusMutation,
} from "@/store/api/sell4meApi";

export default function MerchantOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetOrderQuery(params.id, {
    skip: !params.id,
  });
  const [updateOrderStatus, { isLoading: saving }] =
    useUpdateOrderStatusMutation();
  const order = data?.order;
  const { data: fezTracking } = useTrackFezOrderQuery(order?.fez_order_no || "", {
    skip: !order?.fez_order_no,
  });
  const [status, setStatus] = useState<OrderStatus>("pending");

  useEffect(() => {
    if (order) setStatus(order.status);
  }, [order]);

  useEffect(() => {
    if (error) toast.error(getErrorMessage(error, "Failed to load order"));
  }, [error]);

  if (!order || isLoading) {
    return (
      <DashboardShell title="Order">
        <div className="flex justify-center py-16">
          <Spinner className="size-8" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Order detail"
      subtitle={order.id}
      action={
        <div className="flex gap-2">
          <Select
            className="w-40"
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
          >
            {[
              "pending",
              "confirmed",
              "processing",
              "shipped",
              "delivered",
              "cancelled",
            ].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Button
            disabled={saving}
            onClick={async () => {
              try {
                await updateOrderStatus({ id: order.id, status }).unwrap();
                toast.success("Status updated");
              } catch (err) {
                toast.error(getErrorMessage(err, "Update failed"));
              }
            }}
          >
            Save
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-5 lg:col-span-2">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={order.status} />
            <StatusBadge status={order.payment_status} />
            {order.delivery_status ? (
              <StatusBadge status={order.delivery_status} />
            ) : null}
          </div>
          <ul className="mt-5 divide-y divide-border">
            {order.items.map((item, idx) => (
              <li key={`${item.product_id}-${idx}`} className="flex justify-between py-3 text-sm">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium">{formatNaira(item.line_total)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4">
          <div className="surface-card p-5 text-sm">
            <h3 className="font-semibold">Delivery</h3>
            <p className="mt-3 text-muted">{order.recipient_address}</p>
            <p className="mt-1">
              {order.city ? `${order.city}, ` : ""}
              {order.recipient_state}
            </p>
            <p className="mt-2">{order.recipient_phone}</p>
            {order.waybill_number ? (
              <p className="mt-3 text-xs text-muted">
                Waybill {order.waybill_number}
              </p>
            ) : null}
            {order.fez_order_no ? (
              <p className="mt-2 text-xs text-muted">Fez order {order.fez_order_no}</p>
            ) : null}
            {fezTracking ? (
              <pre className="mt-4 overflow-x-auto rounded-xl bg-surface-soft p-3 text-[11px] text-muted">
                {JSON.stringify(fezTracking, null, 2)}
              </pre>
            ) : null}
          </div>
          <div className="surface-card p-5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{formatNaira(order.subtotal)}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-muted">Commission</span>
              <span>{formatNaira(order.total_commission)}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-muted">Delivery</span>
              <span>{formatNaira(order.delivery_fee || 0)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-border pt-3 font-semibold">
              <span>Total</span>
              <span className="text-brand">
                {formatNaira(order.total + (order.delivery_fee || 0))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
