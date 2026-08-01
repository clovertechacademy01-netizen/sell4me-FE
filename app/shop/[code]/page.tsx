"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { FadeIn } from "@/components/motion";
import { ProductGrid, StoreDiscoverySections } from "@/components/store-card";
import { Button, EmptyState, Spinner } from "@/components/ui";
import { getErrorMessage } from "@/lib/axios";
import { peekAffiliateCode } from "@/lib/session";
import { customerUnitPrice, formatNaira } from "@/lib/utils";
import {
  useAddCartItemsMutation,
  useClearCartMutation,
  useGetAffiliateQuery,
} from "@/store/api/sell4meApi";
import { useAppDispatch } from "@/store/hooks";
import { rememberAffiliate } from "@/store/slices/cartSlice";

export default function ShopLandingPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const code = params.code;
  const { data, isLoading, error } = useGetAffiliateQuery(code, {
    skip: !code,
  });
  const [addCartItems, { isLoading: adding }] = useAddCartItemsMutation();
  const [clearCart, { isLoading: clearing }] = useClearCartMutation();
  const busy = adding || clearing;

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
    const storeProducts = data.store_products || [];
    const similar = data.similar_products || [];
    const general = data.general_products || [];

    return (
      <div className="container-page space-y-12 py-8">
        <FadeIn className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr] lg:items-start">
          <div className="relative aspect-square max-h-[380px] overflow-hidden rounded-xl border border-border bg-surface-soft">
            {data.product.image ? (
              <Image
                src={data.product.image}
                alt={data.product.name}
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
          <div className="flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.16em] text-brand">
              Shared via partner · {data.store.name}
            </p>
            <h1 className="mt-2 display-font text-3xl font-semibold tracking-tight sm:text-4xl">
              {data.product.name}
            </h1>
            <p className="mt-3 text-2xl font-semibold text-brand">
              {formatNaira(total)}
            </p>
            <p className="mt-1 text-sm text-muted">
              Includes partner commission · per {data.product.unit}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                size="lg"
                disabled={busy || data.product.quantity <= 0}
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
              <Button
                size="lg"
                variant="secondary"
                disabled={busy || data.product.quantity <= 0}
                onClick={async () => {
                  try {
                    await clearCart().unwrap();
                    await addCartItems({
                      items: [{ product_id: data.product.id, quantity: 1 }],
                      affiliate_code: peekAffiliateCode(),
                    }).unwrap();
                    router.push("/checkout");
                  } catch (err) {
                    toast.error(
                      getErrorMessage(err, "Could not start checkout"),
                    );
                  }
                }}
              >
                Buy now
              </Button>
              <Link href={`/stores/${data.store.id}`}>
                <Button size="lg" variant="ghost">
                  Visit store
                </Button>
              </Link>
            </div>
          </div>
        </FadeIn>

        {storeProducts.length ? (
          <section>
            <h2 className="display-font text-2xl font-semibold">
              More from {data.store.name}
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

  const products = data.store_products || [];
  const similarStores = data.similar_stores || [];
  const generalStores = data.general_stores || [];

  return (
    <div className="container-page space-y-10 py-8">
      <FadeIn className="overflow-hidden rounded-xl border border-border bg-white">
        <div className="relative bg-[linear-gradient(120deg,#0066ff,#3d8bff)] px-5 py-8 text-white sm:px-8 sm:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.25),transparent_45%)]" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/80">
                Partner store link
              </p>
              <h1 className="mt-2 display-font text-3xl font-semibold sm:text-4xl">
                {data.store.name}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-white/85 sm:text-base">
                {data.store.description}
              </p>
            </div>
            {data.store.logo ? (
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-white/30 bg-white/20 sm:size-20">
                <Image
                  src={data.store.logo}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
            ) : null}
          </div>
        </div>
      </FadeIn>

      <section>
        <h2 className="display-font text-2xl font-semibold">Store products</h2>
        <p className="mt-1 text-sm text-muted">
          Everything currently listed in this store.
        </p>
        <div className="mt-5">
          {products.length ? (
            <ProductGrid products={products} />
          ) : (
            <EmptyState
              title="No products yet"
              description="This store has not listed any products."
            />
          )}
        </div>
      </section>

      <StoreDiscoverySections
        similar={similarStores}
        general={generalStores}
      />
    </div>
  );
}
