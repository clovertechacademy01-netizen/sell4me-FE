"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { FadeIn } from "@/components/motion";
import { ProductCard } from "@/components/product-card";
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

  return (
    <div className="container-page space-y-10 py-10">
      <FadeIn className="overflow-hidden rounded-[2rem] border border-border bg-white">
        <div className="relative min-h-[240px] bg-[linear-gradient(120deg,#0b1220,#0066ff)] px-6 py-12 text-white sm:px-10">
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/70">
                {store.product_category} · {store.business_line}
              </p>
              <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold">
                {store.name}
              </h1>
              <p className="mt-3 max-w-2xl text-white/85">{store.description}</p>
            </div>
            {store.logo ? (
              <div className="relative size-24 overflow-hidden rounded-2xl border border-white/20 bg-white/10">
                <Image src={store.logo} alt="" fill className="object-cover" />
              </div>
            ) : null}
          </div>
        </div>
      </FadeIn>

      {products.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No products yet"
          description="This store has not listed any products."
        />
      )}
    </div>
  );
}
