"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { FadeIn } from "@/components/motion";
import { ProductGrid, StoreDiscoverySections } from "@/components/store-card";
import { EmptyState, Spinner } from "@/components/ui";
import { getErrorMessage } from "@/lib/axios";
import { useGetPublicStoreQuery } from "@/store/api/sell4meApi";

export default function StorePage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetPublicStoreQuery(params.id, {
    skip: !params.id,
  });

  if (isLoading) {
    return (
      <div className="container-page flex min-h-[50vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (error || !data?.store) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Store unavailable"
          description={error ? getErrorMessage(error, "Store not found") : ""}
        />
      </div>
    );
  }

  const { store } = data;
  const products = data.products || [];
  const similarStores = data.similar_stores || [];
  const generalStores = data.general_stores || [];

  return (
    <div className="container-page space-y-10 py-8">
      <FadeIn className="overflow-hidden rounded-xl border border-border bg-white">
        <div className="relative bg-[linear-gradient(120deg,#072a20,#0b3d2e)] px-5 py-8 text-white sm:px-8 sm:py-10">
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/70">
                {store.product_category} · {store.business_line}
              </p>
              <h1 className="mt-2 display-font text-3xl font-semibold sm:text-4xl">
                {store.name}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/85 sm:text-base">
                {store.description}
              </p>
            </div>
            {store.logo ? (
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-white/20 bg-white/10 sm:size-20">
                <Image src={store.logo} alt="" fill className="object-cover" />
              </div>
            ) : null}
          </div>
        </div>
      </FadeIn>

      <section>
        <h2 className="display-font text-2xl font-semibold">Products</h2>
        <div className="mt-5">
          {products.length ? (
            <ProductGrid products={products} />
          ) : (
            <EmptyState
              title="No Products Yet"
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
