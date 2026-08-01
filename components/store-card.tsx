"use client";

import Image from "next/image";
import Link from "next/link";
import { Store as StoreIcon } from "lucide-react";
import type { Product, RelatedStoreCatalog, Store } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/product-card";

export function StoreCard({
  store,
  className,
}: {
  store: Store;
  className?: string;
}) {
  return (
    <Link
      href={`/stores/${store.id}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-white transition duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-[0_4px_12px_rgba(10,42,107,0.08)]",
        className,
      )}
    >
      <div className="relative flex aspect-[16/10] items-end overflow-hidden bg-[linear-gradient(135deg,#0b1220,#0066ff)] p-3">
        {store.logo ? (
          <div className="relative size-12 overflow-hidden rounded-full border-2 border-white/40 bg-white/20">
            <Image
              src={store.logo}
              alt={store.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
        ) : (
          <div className="grid size-12 place-items-center rounded-full border-2 border-white/40 bg-white/15 text-white">
            <StoreIcon className="size-5" />
          </div>
        )}
      </div>
      <div className="space-y-1 p-3">
        <h3 className="line-clamp-1 text-sm font-semibold text-foreground group-hover:text-brand">
          {store.name}
        </h3>
        <p className="line-clamp-1 text-[11px] text-muted">
          {store.product_category}
          {store.business_line ? ` · ${store.business_line}` : ""}
        </p>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted">
          {store.description}
        </p>
      </div>
    </Link>
  );
}

export function RelatedStoreSection({
  store,
  products,
}: {
  store: Store;
  products: Product[];
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/stores/${store.id}`}
            className="display-font text-xl font-semibold tracking-tight hover:text-brand"
          >
            {store.name}
          </Link>
          <p className="mt-0.5 truncate text-xs text-muted">
            {store.product_category}
            {store.business_line ? ` · ${store.business_line}` : ""}
          </p>
        </div>
        <Link
          href={`/stores/${store.id}`}
          className="shrink-0 text-sm font-medium text-brand hover:underline"
        >
          View store
        </Link>
      </div>
      {products.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">No products listed yet.</p>
      )}
    </section>
  );
}

export function ProductGrid({
  products,
  className,
}: {
  products: Product[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export function StoreDiscoverySections({
  similar,
  general,
}: {
  similar: RelatedStoreCatalog[];
  general: RelatedStoreCatalog[];
}) {
  return (
    <>
      {similar.length ? (
        <section className="space-y-8">
          <div>
            <h2 className="display-font text-2xl font-semibold">
              Similar stores
            </h2>
            <p className="mt-1 text-sm text-muted">
              Other merchants in a related category.
            </p>
          </div>
          {similar.map((item) => (
            <RelatedStoreSection
              key={item.store.id}
              store={item.store}
              products={item.products}
            />
          ))}
        </section>
      ) : null}

      {general.length ? (
        <section className="space-y-8">
          <div>
            <h2 className="display-font text-2xl font-semibold">
              More stores to explore
            </h2>
            <p className="mt-1 text-sm text-muted">
              Browse other merchants and their products.
            </p>
          </div>
          {general.map((item) => (
            <RelatedStoreSection
              key={item.store.id}
              store={item.store}
              products={item.products}
            />
          ))}
        </section>
      ) : null}
    </>
  );
}
