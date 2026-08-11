"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/axios";
import { peekAffiliateCode } from "@/lib/session";
import type { Product } from "@/lib/types";
import { cn, formatNaira, formatTitle } from "@/lib/utils";
import { useAddCartItemsMutation, useClearCartMutation } from "@/store/api/sell4meApi";

export function ProductCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const router = useRouter();
  const [addCartItems, { isLoading: adding }] = useAddCartItemsMutation();
  const [clearCart, { isLoading: clearing }] = useClearCartMutation();
  const isLoading = adding || clearing;
  const total = Number(product.price || 0);
  const outOfStock = product.quantity <= 0;

  const addItem = async (quantity = 1) => {
    await addCartItems({
      items: [{ product_id: product.id, quantity }],
      affiliate_code: peekAffiliateCode(),
    }).unwrap();
  };

  const buyNow = async () => {
    await clearCart().unwrap();
    await addItem(1);
    router.push("/checkout");
  };

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-white transition duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_4px_12px_rgba(11,61,46,0.08)]",
        className,
      )}
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-surface-soft">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              sizes="(max-width:640px) 50vw, (max-width:1280px) 25vw, 20vw"
            />
          ) : (
            <div className="grid h-full place-items-center text-xs text-muted">
              No image
            </div>
          )}
        </div>
        <div className="space-y-1 px-3 pt-3">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-foreground">
            {product.name}
          </h3>
          <p className="truncate text-[11px] text-muted">
            {product.category} · per {product.unit}
          </p>
        </div>
      </Link>
      <div className="mt-auto space-y-2 px-3 pb-3 pt-2">
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="display-font text-base font-semibold tracking-tight text-accent">
              {formatNaira(total)}
            </p>
            {outOfStock ? (
              <span className="text-[11px] font-medium text-danger">Sold out</span>
            ) : (
              <span className="text-[11px] text-muted">{product.quantity} left</span>
            )}
          </div>
          <button
            type="button"
            disabled={outOfStock || isLoading}
            aria-label="Add to cart"
            className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
            onClick={async () => {
              try {
                await addItem(1);
                toast.success("Added to cart");
              } catch (error) {
                toast.error(getErrorMessage(error, "Could not add to cart"));
              }
            }}
          >
            <ShoppingCart className="size-4" />
          </button>
        </div>
        <button
          type="button"
          disabled={outOfStock || isLoading}
          className="h-9 w-full rounded-lg bg-brand text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
          onClick={async () => {
            try {
              await buyNow();
            } catch (error) {
              toast.error(getErrorMessage(error, "Could not start checkout"));
            }
          }}
        >
          Buy
        </button>
      </div>
    </article>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "delivered" ||
    status === "paid" ||
    status === "active" ||
    status === "completed"
      ? "success"
      : status === "pending"
        ? "warning"
        : status === "processing" || status === "confirmed" || status === "shipped"
          ? "brand"
          : status === "cancelled" || status === "failed" || status === "suspended"
            ? "danger"
            : "neutral";

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        tone === "success" && "bg-emerald-100 text-emerald-800",
        tone === "warning" && "bg-[#ffdbd0] text-[#832600]",
        tone === "danger" && "bg-[#ffdad6] text-[#93000a]",
        tone === "brand" && "bg-brand-soft text-brand-strong",
        tone === "neutral" && "bg-surface-high text-muted",
      )}
    >
      {formatTitle(status)}
    </span>
  );
}
