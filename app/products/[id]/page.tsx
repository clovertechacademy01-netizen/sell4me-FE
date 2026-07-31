"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { FadeIn } from "@/components/motion";
import { ProductCard } from "@/components/product-card";
import { Button, EmptyState, Spinner } from "@/components/ui";
import { getErrorMessage } from "@/lib/axios";
import { peekAffiliateCode } from "@/lib/session";
import { customerUnitPrice, formatNaira } from "@/lib/utils";
import {
  useAddCartItemsMutation,
  useGetPublicProductQuery,
} from "@/store/api/sell4meApi";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetPublicProductQuery(params.id, {
    skip: !params.id,
  });
  const [addCartItems] = useAddCartItemsMutation();
  const [qty, setQty] = useState(1);

  if (isLoading) {
    return (
      <div className="container-page flex min-h-[50vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (error || !data?.product) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Product unavailable"
          description={error ? getErrorMessage(error, "Product not found") : ""}
        />
      </div>
    );
  }

  const { product, store } = data;
  const related = data.related_products || [];
  const total = customerUnitPrice(product.price, product.commission);

  return (
    <div className="container-page space-y-12 py-10">
      <FadeIn className="grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-border bg-surface-soft">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width:1024px) 100vw, 50vw"
            />
          ) : (
            <div className="grid h-full place-items-center text-muted">No image</div>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-brand">
            {product.category}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight">
            {product.name}
          </h1>
          {store ? (
            <Link
              href={`/stores/${store.id}`}
              className="mt-2 inline-block text-sm text-muted hover:text-brand"
            >
              Sold by {store.name}
            </Link>
          ) : null}
          <p className="mt-5 text-3xl font-semibold text-brand">{formatNaira(total)}</p>
          <p className="text-sm text-muted">per {product.unit}</p>

          {product.specifications &&
          Object.keys(product.specifications).length > 0 ? (
            <dl className="mt-6 grid gap-2 rounded-2xl border border-border bg-white p-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4 text-sm">
                  <dt className="text-muted">{key}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <input
              type="number"
              min={1}
              max={product.quantity}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              className="h-12 w-24 rounded-xl border border-border bg-white px-3"
            />
            <Button
              size="lg"
              disabled={product.quantity <= 0}
              onClick={async () => {
                try {
                  await addCartItems({
                    items: [{ product_id: product.id, quantity: qty }],
                    affiliate_code: peekAffiliateCode(),
                  }).unwrap();
                  toast.success("Added to cart");
                } catch (err) {
                  toast.error(getErrorMessage(err, "Could not add item"));
                }
              }}
            >
              Add to cart
            </Button>
          </div>
        </div>
      </FadeIn>

      {related.length ? (
        <section>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
            Related products
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
