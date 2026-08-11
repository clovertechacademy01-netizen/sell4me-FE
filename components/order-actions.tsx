"use client";

import { Eye, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ActionMenu } from "@/components/action-menu";
import { Modal } from "@/components/modal";
import { StatusBadge } from "@/components/product-card";
import { Select } from "@/components/select";
import { Button, Spinner } from "@/components/ui";
import { getErrorMessage } from "@/lib/axios";
import type { Order, OrderStatus } from "@/lib/types";
import { formatNaira, formatTitle } from "@/lib/utils";
import {
  useGetOrderQuery,
  useTrackFezOrderQuery,
  useUpdateOrderStatusMutation,
} from "@/store/api/sell4meApi";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export function MerchantOrderRowActions({ order }: { order: Order }) {
  const [mode, setMode] = useState<"view" | "update" | null>(null);

  return (
    <>
      <ActionMenu
        label={`Actions for order ${order.id.slice(0, 8)}`}
        items={[
          {
            id: "view",
            label: "View",
            icon: <Eye className="size-4" />,
            onSelect: () => setMode("view"),
          },
          {
            id: "update",
            label: "Update Status",
            icon: <Pencil className="size-4" />,
            onSelect: () => setMode("update"),
          },
        ]}
      />
      <OrderViewModal
        order={order}
        open={mode === "view"}
        onClose={() => setMode(null)}
        onUpdate={() => setMode("update")}
        fetchDetails
      />
      <OrderStatusModal
        order={order}
        open={mode === "update"}
        onClose={() => setMode(null)}
      />
    </>
  );
}

export function PartnerOrderRowActions({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ActionMenu
        label={`Actions for order ${order.id.slice(0, 8)}`}
        items={[
          {
            id: "view",
            label: "View",
            icon: <Eye className="size-4" />,
            onSelect: () => setOpen(true),
          },
        ]}
      />
      <OrderViewModal
        order={order}
        open={open}
        onClose={() => setOpen(false)}
        partner
      />
    </>
  );
}

export function OrderViewModal({
  order: listed,
  orderId,
  open,
  onClose,
  onUpdate,
  fetchDetails = false,
  partner = false,
}: {
  order?: Order;
  orderId?: string;
  open: boolean;
  onClose: () => void;
  onUpdate?: () => void;
  fetchDetails?: boolean;
  partner?: boolean;
}) {
  const id = listed?.id || orderId || "";
  const shouldFetch = Boolean(open && id && (fetchDetails || !listed));
  const { data, isFetching } = useGetOrderQuery(id, {
    skip: !shouldFetch,
  });
  const order = data?.order ?? listed;
  const { data: fezTracking } = useTrackFezOrderQuery(order?.fez_order_no || "", {
    skip: !open || !order?.fez_order_no,
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={`Order #${(order?.id || id).slice(0, 8)}`}
      description={order?.store_name}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
          {onUpdate ? (
            <Button type="button" onClick={onUpdate}>
              Update Status
            </Button>
          ) : null}
        </>
      }
    >
      {isFetching || !order ? (
        <div className="flex justify-center py-10">
          <Spinner className="size-8" />
        </div>
      ) : (
        <OrderDetails order={order} fezTracking={fezTracking} partner={partner} />
      )}
    </Modal>
  );
}

function OrderDetails({
  order,
  fezTracking,
  partner,
}: {
  order: Order;
  fezTracking?: unknown;
  partner: boolean;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <StatusBadge status={order.status} />
        <StatusBadge status={order.payment_status} />
        {order.delivery_status ? (
          <StatusBadge status={order.delivery_status} />
        ) : null}
      </div>

      {order.items?.length ? (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {order.items.map((item, idx) => (
            <li
              key={`${item.product_id}-${idx}`}
              className="flex justify-between gap-3 px-4 py-3 text-sm"
            >
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="font-medium">{formatNaira(item.line_total)}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {!partner ? (
        <div className="rounded-xl bg-surface-soft px-4 py-3 text-sm">
          <p className="font-semibold">
            {order.delivery_method === "locker"
              ? "Locker pickup"
              : "Direct delivery"}
          </p>
          <p className="mt-2 text-muted">
            {order.delivery_method === "locker"
              ? order.locker_address || order.recipient_address || "—"
              : order.recipient_address || "—"}
          </p>
          {order.locker_id ? (
            <p className="mt-1 text-xs text-muted">Locker ID · {order.locker_id}</p>
          ) : null}
          <p className="mt-1">
            {order.city ? `${order.city}, ` : ""}
            {order.recipient_state}
          </p>
          {order.recipient_phone ? (
            <p className="mt-2">{order.recipient_phone}</p>
          ) : null}
          {order.tracking_code ? (
            <p className="mt-3 font-mono text-sm tracking-wider text-brand">
              {order.tracking_code}
            </p>
          ) : null}
          {order.waybill_number ? (
            <p className="mt-2 text-xs text-muted">
              Waybill {order.waybill_number}
            </p>
          ) : null}
          {order.fez_order_no ? (
            <p className="mt-1 text-xs text-muted">Fez {order.fez_order_no}</p>
          ) : null}
        </div>
      ) : null}

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Subtotal</dt>
          <dd>{formatNaira(order.subtotal)}</dd>
        </div>
        {order.total_commission != null ? (
          <div className="flex justify-between gap-3">
            <dt className="text-muted">
              {partner ? "Your commission" : "Partner share"}
            </dt>
            <dd className={partner ? "font-semibold text-accent" : undefined}>
              {formatNaira(order.total_commission)}
            </dd>
          </div>
        ) : null}
        {!partner ? (
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Delivery</dt>
            <dd>{formatNaira(order.delivery_fee || 0)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-3 border-t border-border pt-2 font-semibold">
          <dt>{partner ? "Order total" : "Customer total"}</dt>
          <dd className="text-brand">
            {formatNaira(order.total + (partner ? 0 : order.delivery_fee || 0))}
          </dd>
        </div>
      </dl>

      {fezTracking && !partner ? (
        <pre className="overflow-x-auto rounded-xl bg-surface-soft p-3 text-[11px] text-muted">
          {JSON.stringify(fezTracking, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}

export function OrderStatusModal({
  order,
  open,
  onClose,
}: {
  order: Order;
  open: boolean;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [updateOrderStatus, { isLoading }] = useUpdateOrderStatusMutation();

  useEffect(() => {
    if (open) setStatus(order.status);
  }, [open, order.status]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Update order status"
      description={`Order #${order.id.slice(0, 8)} · ${order.store_name}`}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isLoading || status === order.status}
            onClick={async () => {
              try {
                await updateOrderStatus({ id: order.id, status }).unwrap();
                toast.success("Status updated");
                onClose();
              } catch (err) {
                toast.error(getErrorMessage(err, "Update failed"));
              }
            }}
          >
            {isLoading ? "Saving…" : "Save status"}
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap gap-2">
        <StatusBadge status={order.status} />
        <StatusBadge status={order.payment_status} />
      </div>
      <div className="mt-4">
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          options={ORDER_STATUSES.map((item) => ({
            value: item,
            label: formatTitle(item),
          }))}
        />
      </div>
    </Modal>
  );
}
