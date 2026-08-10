"use client";

import Link from "next/link";
import { useEffect } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatusBadge } from "@/components/product-card";
import { Button, EmptyState } from "@/components/ui";
import { getErrorMessage } from "@/lib/axios";
import { formatNaira } from "@/lib/utils";
import { useListProductsQuery } from "@/store/api/sell4meApi";

export default function MerchantProductsPage() {
  const { data, error } = useListProductsQuery({ limit: 50 });
  const items = data?.items || [];

  useEffect(() => {
    if (error) toast.error(getErrorMessage(error, "Failed to load products"));
  }, [error]);

  return (
    <DashboardShell
      title="Products"
      subtitle="Manage inventory, pricing, and partner commission percentages."
      action={
        <Link href="/merchant/products/new">
          <Button>Add product</Button>
        </Link>
      }
    >
      {items.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Create your first product with price, stock, and commission %."
          action={
            <Link href="/merchant/products/new">
              <Button>Add product</Button>
            </Link>
          }
        />
      ) : (
        <div className="surface-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Commission</th>
                <th>Stock</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium">{item.name}</td>
                  <td>{formatNaira(item.price)}</td>
                  <td>{item.commission}%</td>
                  <td>{item.quantity}</td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/merchant/products/${item.id}`}
                      className="font-medium text-accent hover:underline"
                    >
                      Edit
                    </Link>
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
