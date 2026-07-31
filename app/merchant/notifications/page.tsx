"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button, EmptyState } from "@/components/ui";
import { getErrorMessage } from "@/lib/axios";
import {
  useListNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/store/api/sell4meApi";

export default function MerchantNotificationsPage() {
  const { data, error } = useListNotificationsQuery({ limit: 50 });
  const [markAllRead] = useMarkAllNotificationsReadMutation();
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
      {items.length === 0 ? (
        <EmptyState
          title="You're all caught up"
          description="Order payment and delivery alerts will show up here."
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <button
              key={item.id}
              className={`w-full rounded-3xl border p-5 text-left transition ${
                item.read_at
                  ? "border-border bg-white"
                  : "border-brand/30 bg-brand-soft/40"
              }`}
              onClick={async () => {
                if (!item.read_at) {
                  try {
                    await markRead(item.id).unwrap();
                  } catch {
                    /* ignore */
                  }
                }
              }}
            >
              <p className="font-semibold">{item.title}</p>
              <p className="mt-1 text-sm text-muted">{item.body}</p>
            </button>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
