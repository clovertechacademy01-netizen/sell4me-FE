"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/axios";
import { peekAffiliateCode } from "@/lib/session";
import type { Product } from "@/lib/types";
import { cn, customerUnitPrice, formatNaira } from "@/lib/utils";
import { useAddCartItemsMutation } from "@/store/api/sell4meApi";

export function ProductCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const [addCartItems, { isLoading }] = useAddCartItemsMutation();
  const total = customerUnitPrice(product.price, product.commission);
  const outOfStock = product.quantity <= 0;

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-xl border border-border bg-white transition duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-[0_4px_12px_rgba(10,42,107,0.08)]",
        className,
      )}
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-soft">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              sizes="(max-width:768px) 100vw, 33vw"
            />
          ) : (
            <div className="grid h-full place-items-center text-sm text-muted">
              No image
            </div>
          )}
        </div>
        <div className="space-y-2 p-4 pb-3">
          <h3 className="line-clamp-2 text-base font-medium leading-snug text-foreground">
            {product.name}
          </h3>
          <p className="text-xs text-muted">
            {product.category} · per {product.unit}
          </p>
        </div>
      </Link>
      <div className="flex items-center justify-between gap-3 px-4 pb-4">
        <div>
          <p className="display-font text-xl font-semibold tracking-tight">
            {formatNaira(total)}
          </p>
          {outOfStock ? (
            <span className="text-xs font-medium text-danger">Sold out</span>
          ) : (
            <span className="text-xs text-muted">{product.quantity} left</span>
          )}
        </div>
        <button
          type="button"
          disabled={outOfStock || isLoading}
          aria-label="Add to cart"
          className="grid size-11 place-items-center rounded-lg bg-brand text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
          onClick={async () => {
            try {
              await addCartItems({
                items: [{ product_id: product.id, quantity: 1 }],
                affiliate_code: peekAffiliateCode(),
              }).unwrap();
              toast.success("Added to cart");
            } catch (error) {
              toast.error(getErrorMessage(error, "Could not add to cart"));
            }
          }}
        >
          <ShoppingCart className="size-5" />
        </button>
      </div>
    </article>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "delivered" || status === "paid" || status === "active"
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
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize tracking-wide",
        tone === "success" && "bg-emerald-100 text-emerald-800",
        tone === "warning" && "bg-[#ffdbd0] text-[#832600]",
        tone === "danger" && "bg-[#ffdad6] text-[#93000a]",
        tone === "brand" && "bg-brand-soft text-brand-strong",
        tone === "neutral" && "bg-surface-high text-muted",
      )}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
