"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard-shell";
import { PartnerOrderRowActions } from "@/components/order-actions";
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
      title="Attributed Orders"
      subtitle="Commission credits when these orders are delivered and paid."
    >
      {items.length === 0 ? (
        <EmptyState
          title="No Attributed Orders"
          description="When shoppers buy through your links, orders show up here."
        />
      ) : (
        <div className="surface-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Store</th>
                <th>Status</th>
                <th>Commission</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((order) => (
                <tr key={order.id}>
                  <td className="font-medium">#{order.id.slice(0, 8)}</td>
                  <td>{order.store_name}</td>
                  <td>
                    <div className="flex flex-wrap gap-1.5">
                      <StatusBadge status={order.status} />
                      <StatusBadge status={order.payment_status} />
                    </div>
                  </td>
                  <td className="font-semibold text-accent">
                    {formatNaira(order.total_commission || 0)}
                  </td>
                  <td className="text-right">
                    <PartnerOrderRowActions order={order} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}
