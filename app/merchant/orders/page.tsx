"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatusBadge } from "@/components/product-card";
import { EmptyState } from "@/components/ui";
import { getErrorMessage } from "@/lib/axios";
import { formatNaira } from "@/lib/utils";
import { useListOrdersQuery } from "@/store/api/sell4meApi";
import { Select } from "@/components/select";

export default function MerchantOrdersPage() {
  const [status, setStatus] = useState("");
  const { data, error } = useListOrdersQuery({
    limit: 50,
    status: status || undefined,
  });
  const items = data?.items || [];

  useEffect(() => {
    if (error) toast.error(getErrorMessage(error, "Failed to load orders"));
  }, [error]);

  return (
    <DashboardShell
      title="Orders"
      subtitle="Paid orders need fulfilment. Payouts credit when delivery completes."
      action={
        <Select
          className="w-44"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
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
      }
    >
      {items.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="When customers pay, orders appear here with delivery details."
        />
      ) : (
        <div className="space-y-3">
          {items.map((order) => (
            <Link
              key={order.id}
              href={`/merchant/orders/${order.id}`}
              className="block surface-card p-5 transition hover:border-brand/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{order.store_name}</p>
                  <p className="mt-1 text-xs text-muted">{order.id}</p>
                </div>
                <div className="flex gap-2">
                  <StatusBadge status={order.status} />
                  <StatusBadge status={order.payment_status} />
                </div>
              </div>
              <div className="mt-3 flex justify-between text-sm">
                <span className="text-muted">
                  {order.items?.length || 0} items · {order.recipient_state}
                </span>
                <span className="font-semibold text-accent">
                  {formatNaira(order.total + (order.delivery_fee || 0))}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
