"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button, EmptyState } from "@/components/ui";
import { getErrorMessage } from "@/lib/axios";
import { cn } from "@/lib/utils";
import {
  useListNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/store/api/sell4meApi";

function formatWhen(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

export default function MerchantNotificationsPage() {
  const router = useRouter();
  const { data, error, isLoading } = useListNotificationsQuery({ limit: 50 });
  const [markAllRead, { isLoading: markingAll }] =
    useMarkAllNotificationsReadMutation();
  const [markRead] = useMarkNotificationReadMutation();
  const items = data?.items || [];
  const unread = data?.unread_count || 0;

  useEffect(() => {
    if (error)
      toast.error(getErrorMessage(error, "Failed to load notifications"));
  }, [error]);

  return (
    <DashboardShell
      title="Notifications"
      subtitle={`${unread} unread`}
      action={
        <Button
          variant="secondary"
          disabled={markingAll || unread === 0}
          onClick={async () => {
            try {
              await markAllRead().unwrap();
              toast.success("Marked all as read");
            } catch (err) {
              toast.error(getErrorMessage(err, "Failed"));
            }
          }}
        >
          Mark all read
        </Button>
      }
    >
      {isLoading ? (
        <p className="text-sm text-muted">Loading notifications…</p>
      ) : items.length === 0 ? (
        <EmptyState
          title="You're all caught up"
          description="Order payment and delivery alerts will show up here."
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const when = formatWhen(item.createdAt || item.created_at);
            const href = item.order_id
              ? `/merchant/orders/${item.order_id}`
              : undefined;

            return (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "w-full rounded-xl border p-5 text-left transition",
                  item.read_at
                    ? "border-border bg-white"
                    : "border-brand/30 bg-brand-soft/40",
                )}
                onClick={async () => {
                  if (!item.read_at) {
                    try {
                      await markRead(item.id).unwrap();
                    } catch {
                      /* ignore */
                    }
                  }
                  if (href) router.push(href);
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold">{item.title}</p>
                  {when ? (
                    <span className="shrink-0 text-[11px] text-muted">{when}</span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted">{item.body}</p>
                {href ? (
                  <p className="mt-2 text-xs font-medium text-brand">
                    View order
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
