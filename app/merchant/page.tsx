"use client";

import Link from "next/link";
import { Package, Plus, ShoppingBag, Store, Wallet } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { MerchantOrderRowActions } from "@/components/order-actions";
import { StatusBadge } from "@/components/product-card";
import { Button, StatCard } from "@/components/ui";
import { formatNaira } from "@/lib/utils";
import {
  useGetWalletQuery,
  useListOrdersQuery,
  useListProductsQuery,
  useListStoresQuery,
} from "@/store/api/sell4meApi";
import { useAppSelector } from "@/store/hooks";

export default function MerchantHomePage() {
  const user = useAppSelector((s) => s.auth.user);
  const role = user?.role;
  const isAdmin = role === "admin";
  const { data: stores } = useListStoresQuery({ limit: 1 });
  const { data: products } = useListProductsQuery({ limit: 1 });
  const { data: orders } = useListOrdersQuery({ limit: 5 });
  const { data: wallet } = useGetWalletQuery(undefined, { skip: isAdmin });

  const storeName = stores?.items[0]?.name || "";
  const productCount = products?.pagination?.total || products?.items.length || 0;
  const orderCount = orders?.pagination?.total || orders?.items.length || 0;
  const recentOrders = orders?.items || [];

  return (
    <DashboardShell
      title={`Welcome back, ${user?.first_name || "there"}!`}
      subtitle="Here's what is happening with your store today."
      action={
        <Link href={storeName ? "/merchant/products/new" : "/merchant/store"}>
          <Button>
            <Plus className="size-4" />
            {storeName ? "Create New Product" : "Create Store"}
          </Button>
        </Link>
      }
    >
      <div
        className={`grid gap-6 sm:grid-cols-2 ${isAdmin ? "xl:grid-cols-3" : "xl:grid-cols-3"}`}
      >
        <Link href="/merchant/orders" className="block">
          <StatCard
            label="Orders"
            value={String(orderCount)}
            icon={ShoppingBag}
            meta="Open merchant orders"
          />
        </Link>
        {!isAdmin ? (
          <Link href="/merchant/wallet" className="block">
            <StatCard
              label="Total wallet balance"
              value={formatNaira(wallet?.wallet?.balance || 0)}
              icon={Wallet}
              accent
              meta={`Pending ${formatNaira(wallet?.wallet?.pending_balance || 0)}`}
            />
          </Link>
        ) : null}
        <Link href="/merchant/products" className="block">
          <StatCard
            label="Active products"
            value={String(productCount)}
            icon={Package}
            meta={storeName || "Create a store to start listing"}
          />
        </Link>
        <Link href="/merchant/store" className="block xl:col-span-1">
          <StatCard
            label="Store"
            value={storeName || "Not set"}
            icon={Store}
            meta="Manage storefront details"
          />
        </Link>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="display-font text-lg font-semibold tracking-tight">
            Recent Orders
          </h2>
          <Link
            href="/merchant/orders"
            className="text-sm font-semibold text-accent hover:underline"
          >
            View All
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="px-6 py-10 text-sm text-muted">
            No orders yet. Share products with partners to start selling.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Store</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-medium">#{order.id.slice(0, 8)}</td>
                    <td className="text-muted">{order.store_name || "—"}</td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="font-semibold">
                      {formatNaira(order.total)}
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
      </section>
    </DashboardShell>
  );
}
