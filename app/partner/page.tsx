"use client";

import Link from "next/link";
import { Link2, Plus, ShoppingBag, Store, Wallet } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { PartnerOrderRowActions } from "@/components/order-actions";
import { StatusBadge } from "@/components/product-card";
import { Button, StatCard } from "@/components/ui";
import { formatNaira } from "@/lib/utils";
import {
  useGetWalletQuery,
  useListAffiliateLinksQuery,
  useListPartnerOrdersQuery,
} from "@/store/api/sell4meApi";
import { useAppSelector } from "@/store/hooks";

export default function PartnerHomePage() {
  const user = useAppSelector((s) => s.auth.user);
  const role = user?.role;
  const isAdmin = role === "admin";
  const { data: links } = useListAffiliateLinksQuery();
  const { data: orders } = useListPartnerOrdersQuery({ limit: 5 });
  const { data: wallet } = useGetWalletQuery(undefined, { skip: isAdmin });

  const linkCount = links?.items?.length || 0;
  const orderCount = orders?.pagination?.total || orders?.items.length || 0;
  const recentOrders = orders?.items || [];

  return (
    <DashboardShell
      title={`Welcome back, ${user?.first_name || "there"}!`}
      subtitle="Browse the marketplace, generate affiliate links, and earn on delivered orders."
      action={
        <Link href="/partner/marketplace">
          <Button>
            <Plus className="size-4" />
            Open marketplace
          </Button>
        </Link>
      }
    >
      <div
        className={`grid gap-6 ${isAdmin ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}
      >
        <Link href="/partner/marketplace" className="block">
          <StatCard
            label="Marketplace"
            value="Browse"
            icon={Store}
            meta="Stores and products to promote"
          />
        </Link>
        <Link href="/partner/marketplace" className="block">
          <StatCard
            label="Affiliate links"
            value={String(linkCount)}
            icon={Link2}
            meta="Generated from marketplace cards"
          />
        </Link>
        <Link href="/partner/orders" className="block">
          <StatCard
            label="Attributed orders"
            value={String(orderCount)}
            icon={ShoppingBag}
            meta="Orders tagged to your links"
          />
        </Link>
        {!isAdmin ? (
          <Link href="/partner/wallet" className="block">
            <StatCard
              label="Wallet balance"
              value={formatNaira(wallet?.wallet?.balance || 0)}
              icon={Wallet}
              accent
              meta={`Pending ${formatNaira(wallet?.wallet?.pending_balance || 0)}`}
            />
          </Link>
        ) : null}
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="display-font text-lg font-semibold tracking-tight">
            Recent Attributed Orders
          </h2>
          <Link
            href="/partner/orders"
            className="text-sm font-semibold text-accent hover:underline"
          >
            View All
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="px-6 py-10 text-sm text-muted">
            No attributed orders yet. Generate a link from the marketplace and
            start sharing.
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
                      <PartnerOrderRowActions order={order} />
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
