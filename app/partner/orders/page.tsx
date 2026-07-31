"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatusBadge } from "@/components/product-card";
import { EmptyState } from "@/components/ui";
import { getErrorMessage } from "@/lib/axios";
import { formatNaira } from "@/lib/utils";
import { useListPartnerOrdersQuery } from "@/store/api/sell4meApi";

export default function PartnerOrdersPage() {
  const { data, error } = useListPartnerOrdersQuery({ limit: 50 });
  const items = data?.items || [];

  useEffect(() => {
    if (error) toast.error(getErrorMessage(error, "Failed to load orders"));
  }, [error]);

  return (
    <DashboardShell
      title="Attributed orders"
      subtitle="Commission credits when these orders are delivered and paid."
    >
      {items.length === 0 ? (
        <EmptyState
          title="No attributed orders"
          description="When shoppers buy through your links, orders show up here."
        />
      ) : (
        <div className="space-y-3">
          {items.map((order) => (
            <div
              key={order.id}
              className="surface-card p-5"
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
                <span className="text-muted">Your commission</span>
                <span className="font-semibold text-brand">
                  {formatNaira(order.total_commission)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
