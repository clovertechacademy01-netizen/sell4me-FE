"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { FadeIn } from "@/components/motion";
import { Button, EmptyState, Spinner } from "@/components/ui";
import { getErrorMessage } from "@/lib/axios";
import { customerUnitPrice, formatNaira } from "@/lib/utils";
import {
  useGetCartQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from "@/store/api/sell4meApi";
import { useAppSelector } from "@/store/hooks";

export default function CartPage() {
  const { isLoading } = useGetCartQuery();
  const cart = useAppSelector((s) => s.cart.cart);
  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeCartItem] = useRemoveCartItemMutation();

  const groups = useMemo(() => {
    const map = new Map<string, NonNullable<typeof cart>["items"]>();
    cart?.items.forEach((item) => {
      const list = map.get(item.store_id) || [];
      list.push(item);
      map.set(item.store_id, list);
    });
    return Array.from(map.entries());
  }, [cart]);

  if (isLoading && !cart) {
    return (
      <div className="container-page flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Your cart is empty"
          description="Open a partner link or store to start shopping — no account needed."
          action={
            <Link href="/">
              <Button>Browse Sell4Me</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
      <FadeIn className="space-y-6">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
            Cart
          </h1>
          <p className="mt-1 text-sm text-muted">
            Orders are grouped by store at checkout.
          </p>
        </div>

        {groups.map(([storeId, items]) => (
          <div
            key={storeId}
            className="surface-card overflow-hidden"
          >
            <div className="border-b border-border bg-surface-soft px-5 py-3 text-sm font-medium text-muted">
              Store order · {storeId.slice(-6)}
            </div>
            <ul className="divide-y divide-border">
              {items.map((item) => {
                const unit = customerUnitPrice(item.price, item.commission);
                return (
                  <li
                    key={item.product_id}
                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                  >
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-surface-soft">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${item.product_id}`}
                        className="font-semibold hover:text-brand"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-sm text-muted">
                        {formatNaira(unit)} / {item.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="grid size-9 place-items-center rounded-lg border border-border"
                        onClick={async () => {
                          try {
                            if (item.quantity <= 1) {
                              await removeCartItem(item.product_id).unwrap();
                            } else {
                              await updateCartItem({
                                product_id: item.product_id,
                                quantity: item.quantity - 1,
                              }).unwrap();
                            }
                          } catch (err) {
                            toast.error(getErrorMessage(err, "Update failed"));
                          }
                        }}
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        className="grid size-9 place-items-center rounded-lg border border-border"
                        onClick={async () => {
                          try {
                            await updateCartItem({
                              product_id: item.product_id,
                              quantity: item.quantity + 1,
                            }).unwrap();
                          } catch (err) {
                            toast.error(getErrorMessage(err, "Update failed"));
                          }
                        }}
                      >
                        <Plus className="size-4" />
                      </button>
                      <button
                        className="ml-2 grid size-9 place-items-center rounded-lg border border-border text-danger"
                        onClick={async () => {
                          try {
                            await removeCartItem(item.product_id).unwrap();
                          } catch (err) {
                            toast.error(getErrorMessage(err, "Remove failed"));
                          }
                        }}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <p className="min-w-24 text-right font-semibold">
                      {formatNaira(item.line_total + item.line_commission)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </FadeIn>

      <FadeIn delay={0.08} className="surface-card h-fit p-6 lg:sticky lg:top-24">
        <h2 className="font-semibold">Summary</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd>{formatNaira(cart.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Partner commission</dt>
            <dd>{formatNaira(cart.total_commission)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
            <dt>Items total</dt>
            <dd className="text-brand">{formatNaira(cart.total)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted">
          Delivery fees are calculated at checkout from your state.
        </p>
        <Link href="/checkout" className="mt-6 block">
          <Button className="w-full" size="lg">
            Checkout
          </Button>
        </Link>
      </FadeIn>
    </div>
  );
}
