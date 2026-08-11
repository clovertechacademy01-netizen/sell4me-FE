"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard-shell";
import { MerchantOrderRowActions, ORDER_STATUSES } from "@/components/order-actions";
import { StatusBadge } from "@/components/product-card";
import { EmptyState } from "@/components/ui";
import { Select } from "@/components/select";
import { getErrorMessage } from "@/lib/axios";
import { formatNaira, formatTitle } from "@/lib/utils";
import { useListOrdersQuery } from "@/store/api/sell4meApi";

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
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((item) => (
            <option key={item} value={item}>
              {formatTitle(item)}
            </option>
          ))}
        </Select>
      }
    >
      {items.length === 0 ? (
        <EmptyState
          title="No Orders Yet"
          description="When customers pay, orders appear here with delivery details."
        />
      ) : (
        <div className="surface-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Store</th>
                <th>Items</th>
                <th>Status</th>
                <th>Amount</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((order) => (
                <tr key={order.id}>
                  <td className="font-medium">#{order.id.slice(0, 8)}</td>
                  <td>
                    <p>{order.store_name}</p>
                    <p className="text-xs text-muted">
                      {order.recipient_state || "—"}
                    </p>
                  </td>
                  <td>{order.items?.length || 0}</td>
                  <td>
                    <div className="flex flex-wrap gap-1.5">
                      <StatusBadge status={order.status} />
                      <StatusBadge status={order.payment_status} />
                    </div>
                  </td>
                  <td className="font-semibold text-accent">
                    {formatNaira(order.total + (order.delivery_fee || 0))}
                  </td>
                  <td className="text-right">
                    <MerchantOrderRowActions order={order} />
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
