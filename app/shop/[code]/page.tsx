"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { FadeIn } from "@/components/motion";
import { ProductCard } from "@/components/product-card";
import { Button, EmptyState, Spinner } from "@/components/ui";
import { getErrorMessage } from "@/lib/axios";
import { peekAffiliateCode } from "@/lib/session";
import type { Product, Store } from "@/lib/types";
import { customerUnitPrice, formatNaira } from "@/lib/utils";
import {
  useAddCartItemsMutation,
  useGetAffiliateQuery,
} from "@/store/api/sell4meApi";
import { useAppDispatch } from "@/store/hooks";
import { rememberAffiliate } from "@/store/slices/cartSlice";

type Landing =
  | {
      type: "product";
      product: Product;
      store: Store;
      related_products?: Product[];
      store_products?: Product[];
    }
  | {
      type: "store";
      store: Store;
      store_products?: Product[];
      related_stores?: Store[];
    };

export default function ShopLandingPage() {
  const params = useParams<{ code: string }>();
  const dispatch = useAppDispatch();
  const code = params.code;
  const { data: raw, isLoading, error } = useGetAffiliateQuery(code, {
    skip: !code,
  });
  const [addCartItems] = useAddCartItemsMutation();
  const data = raw as (Landing & { affiliate_link?: unknown }) | undefined;

  useEffect(() => {
    if (code) dispatch(rememberAffiliate(code));
  }, [code, dispatch]);

  if (isLoading) {
    return (
      <div className="container-page flex min-h-[50vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Link unavailable"
          description={
            error
              ? getErrorMessage(error, "Link not found")
              : "This affiliate link could not be loaded."
          }
          action={
            <Link href="/">
              <Button>Back home</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (data.type === "product") {
    const total = customerUnitPrice(data.product.price, data.product.commission);
    const related = data.related_products?.length
      ? data.related_products
      : data.store_products || [];

    return (
      <div className="container-page space-y-12 py-10">
        <FadeIn className="grid gap-8 lg:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-border bg-surface-soft">
            {data.product.image ? (
              <Image
                src={data.product.image}
                alt={data.product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width:1024px) 100vw, 50vw"
              />
            ) : (
              <div className="grid h-full place-items-center text-muted">No image</div>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.16em] text-brand">
              Shared via partner · {data.store.name}
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight">
              {data.product.name}
            </h1>
            <p className="mt-4 text-3xl font-semibold text-brand">{formatNaira(total)}</p>
            <p className="mt-1 text-sm text-muted">
              Includes partner commission · per {data.product.unit}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={async () => {
                  try {
                    await addCartItems({
                      items: [{ product_id: data.product.id, quantity: 1 }],
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
              <Link href={`/stores/${data.store.id}`}>
                <Button size="lg" variant="secondary">
                  Visit store
                </Button>
              </Link>
            </div>
          </div>
        </FadeIn>

        {related.length ? (
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
              More to explore
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    );
  }

  const products = data.store_products || [];

  return (
    <div className="container-page space-y-10 py-10">
      <FadeIn className="overflow-hidden rounded-[2rem] border border-border bg-white">
        <div className="relative min-h-[280px] bg-[linear-gradient(120deg,#0066ff,#3d8bff)] px-6 py-12 text-white sm:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.25),transparent_45%)]" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/80">
                Partner store link
              </p>
              <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold">
                {data.store.name}
              </h1>
              <p className="mt-3 max-w-xl text-white/85">{data.store.description}</p>
            </div>
            {data.store.logo ? (
              <div className="relative size-24 overflow-hidden rounded-2xl border border-white/30 bg-white/20">
                <Image src={data.store.logo} alt="" fill className="object-cover" />
              </div>
            ) : null}
          </div>
        </div>
      </FadeIn>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
