"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { FadeIn } from "@/components/motion";
import { ProductGrid } from "@/components/store-card";
import { Button, EmptyState, Spinner } from "@/components/ui";
import { getErrorMessage } from "@/lib/axios";
import { peekAffiliateCode } from "@/lib/session";
import { customerUnitPrice, formatNaira } from "@/lib/utils";
import {
  useAddCartItemsMutation,
  useClearCartMutation,
  useGetPublicProductQuery,
} from "@/store/api/sell4meApi";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, error } = useGetPublicProductQuery(params.id, {
    skip: !params.id,
  });
  const [addCartItems, { isLoading: adding }] = useAddCartItemsMutation();
  const [clearCart, { isLoading: clearing }] = useClearCartMutation();
  const busy = adding || clearing;
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
  const storeProducts = data.store_products || [];
  const similar = data.similar_products || [];
  const general = data.general_products || [];
  const total = customerUnitPrice(product.price, product.commission);

  return (
    <div className="container-page space-y-12 py-8">
      <FadeIn className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr] lg:items-start">
        <div className="relative aspect-square max-h-[380px] overflow-hidden rounded-xl border border-border bg-surface-soft">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width:1024px) 100vw, 380px"
            />
          ) : (
            <div className="grid h-full place-items-center text-muted">
              No image
            </div>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-brand">
            {product.category}
          </p>
          <h1 className="mt-2 display-font text-3xl font-semibold tracking-tight sm:text-4xl">
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
          <p className="mt-4 text-2xl font-semibold text-brand">
            {formatNaira(total)}
          </p>
          <p className="text-sm text-muted">per {product.unit}</p>

          {product.specifications &&
          Object.keys(product.specifications).length > 0 ? (
            <dl className="mt-5 grid gap-2 rounded-xl border border-border bg-white p-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4 text-sm">
                  <dt className="text-muted">{key}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <input
              type="number"
              min={1}
              max={product.quantity}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              className="h-11 w-20 rounded-lg border border-border bg-white px-3"
            />
            <Button
              size="lg"
              disabled={product.quantity <= 0 || busy}
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
            <Button
              size="lg"
              variant="secondary"
              disabled={product.quantity <= 0 || busy}
              onClick={async () => {
                try {
                  await clearCart().unwrap();
                  await addCartItems({
                    items: [{ product_id: product.id, quantity: qty }],
                    affiliate_code: peekAffiliateCode(),
                  }).unwrap();
                  router.push("/checkout");
                } catch (err) {
                  toast.error(getErrorMessage(err, "Could not start checkout"));
                }
              }}
            >
              Buy now
            </Button>
          </div>
        </div>
      </FadeIn>

      {storeProducts.length ? (
        <section>
          <h2 className="display-font text-2xl font-semibold">
            More from {store?.name || "this store"}
          </h2>
          <div className="mt-5">
            <ProductGrid products={storeProducts} />
          </div>
        </section>
      ) : null}

      {similar.length ? (
        <section>
          <h2 className="display-font text-2xl font-semibold">
            Similar products
          </h2>
          <p className="mt-1 text-sm text-muted">
            From other merchants in the same category.
          </p>
          <div className="mt-5">
            <ProductGrid products={similar} />
          </div>
        </section>
      ) : null}

      {general.length ? (
        <section>
          <h2 className="display-font text-2xl font-semibold">
            More from other merchants
          </h2>
          <div className="mt-5">
            <ProductGrid products={general} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
