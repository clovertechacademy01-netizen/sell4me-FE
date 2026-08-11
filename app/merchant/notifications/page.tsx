"use client";

import { Eye, MailOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ActionMenu } from "@/components/action-menu";
import { DashboardShell } from "@/components/dashboard-shell";
import { Modal } from "@/components/modal";
import { OrderViewModal } from "@/components/order-actions";
import { Button, EmptyState } from "@/components/ui";
import { getErrorMessage } from "@/lib/axios";
import type { NotificationItem } from "@/lib/types";
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
  const { data, error, isLoading } = useListNotificationsQuery({ limit: 50 });
  const [markAllRead, { isLoading: markingAll }] =
    useMarkAllNotificationsReadMutation();
  const [markRead] = useMarkNotificationReadMutation();
  const items = data?.items || [];
  const unread = data?.unread_count || 0;
  const [viewing, setViewing] = useState<NotificationItem | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (error)
      toast.error(getErrorMessage(error, "Failed to load notifications"));
  }, [error]);

  const openNotification = async (item: NotificationItem) => {
    setViewing(item);
    if (!item.read_at) {
      try {
        await markRead(item.id).unwrap();
      } catch {
        /* ignore */
      }
    }
  };

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
          Mark All Read
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
        <div className="surface-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Notification</th>
                <th>When</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const when = formatWhen(item.createdAt || item.created_at);
                return (
                  <tr key={item.id} className={item.read_at ? "" : "bg-brand-soft/30"}>
                    <td>
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted">
                        {item.body}
                      </p>
                    </td>
                    <td className="whitespace-nowrap text-sm text-muted">
                      {when || "—"}
                    </td>
                    <td className="text-sm">
                      {item.read_at ? "Read" : "Unread"}
                    </td>
                    <td className="text-right">
                      <ActionMenu
                        label={`Actions for ${item.title}`}
                        items={[
                          {
                            id: "view",
                            label: "View",
                            icon: <Eye className="size-4" />,
                            onSelect: () => void openNotification(item),
                          },
                          {
                            id: "read",
                            label: "Mark As Read",
                            icon: <MailOpen className="size-4" />,
                            disabled: Boolean(item.read_at),
                            onSelect: () => {
                              void markRead(item.id)
                                .unwrap()
                                .catch(() => undefined);
                            },
                          },
                        ]}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.title || "Notification"}
        description={formatWhen(viewing?.createdAt || viewing?.created_at)}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setViewing(null)}>
              Close
            </Button>
            {viewing?.order_id ? (
              <Button
                type="button"
                onClick={() => {
                  setOrderId(viewing.order_id || null);
                  setViewing(null);
                }}
              >
                View order
              </Button>
            ) : null}
          </>
        }
      >
        <p className="text-sm leading-relaxed text-foreground">{viewing?.body}</p>
      </Modal>

      <OrderViewModal
        orderId={orderId || undefined}
        open={Boolean(orderId)}
        onClose={() => setOrderId(null)}
      />
    </DashboardShell>
  );
}
