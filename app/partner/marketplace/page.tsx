"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Link2, Loader2, Store as StoreIcon } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard-shell";
import { EmptyState, Spinner } from "@/components/ui";
import { getErrorMessage } from "@/lib/axios";
import type { AffiliateLink, Product, Store } from "@/lib/types";
import { cn, formatNaira, partnerEarning } from "@/lib/utils";
import {
  useCreateAffiliateLinkMutation,
  useListAffiliateLinksQuery,
  useListProductsQuery,
  useListStoresQuery,
} from "@/store/api/sell4meApi";

type Tab = "stores" | "products";

function findExistingLink(
  links: AffiliateLink[],
  type: "store" | "product",
  id: string,
) {
  return links.find((link) =>
    type === "store"
      ? link.type === "store" && link.store_id === id
      : link.type === "product" && link.product_id === id,
  );
}

function AffiliateActionButton({
  type,
  storeId,
  productId,
  existing,
}: {
  type: "store" | "product";
  storeId?: string;
  productId?: string;
  existing?: AffiliateLink;
}) {
  const [createLink, { isLoading }] = useCreateAffiliateLinkMutation();
  const [link, setLink] = useState<AffiliateLink | undefined>(existing);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLink(existing);
  }, [existing]);

  const onGenerate = async () => {
    try {
      const res = await createLink({
        type,
        store_id: type === "store" ? storeId : undefined,
        product_id: type === "product" ? productId : undefined,
      }).unwrap();
      setLink(res.affiliate_link);
      toast.success(res.message || "Affiliate link ready");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not generate link"));
    }
  };

  const onCopy = async () => {
    if (!link?.link_url) return;
    try {
      await navigator.clipboard.writeText(link.link_url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy link");
    }
  };

  if (link?.link_url) {
    return (
      <button
        type="button"
        onClick={onCopy}
        className="grid size-10 place-items-center rounded-lg border border-border bg-white text-brand transition hover:bg-brand-soft"
        aria-label="Copy affiliate link"
        title="Copy affiliate link"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onGenerate}
      disabled={isLoading}
      className="grid size-10 place-items-center rounded-lg bg-brand text-white transition hover:brightness-110 disabled:opacity-60"
      aria-label="Generate affiliate link"
      title="Generate affiliate link"
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Link2 className="size-4" />
      )}
    </button>
  );
}

function StoreCard({
  store,
  existing,
}: {
  store: Store;
  existing?: AffiliateLink;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-border bg-white transition hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(10,42,107,0.08)]">
      <div className="flex items-start gap-3 p-3.5">
        <div className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-soft text-brand">
          {store.logo ? (
            <Image
              src={store.logo}
              alt={store.name}
              fill
              className="object-cover"
              sizes="44px"
            />
          ) : (
            <StoreIcon className="size-5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/partner/marketplace/stores/${store.id}`} className="min-w-0">
              <h3 className="truncate text-sm font-semibold tracking-tight hover:text-accent">
                {store.name}
              </h3>
              <p className="mt-0.5 truncate text-[11px] text-muted">
                {store.product_category}
                {store.business_line ? ` · ${store.business_line}` : ""}
              </p>
            </Link>
            <AffiliateActionButton
              type="store"
              storeId={store.id}
              existing={existing}
            />
          </div>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">
            {store.description}
          </p>
        </div>
      </div>
    </article>
  );
}

function ProductPromoCard({
  product,
  existing,
}: {
  product: Product;
  existing?: AffiliateLink;
}) {
  const price = Number(product.price || 0);
  const earn = partnerEarning(price, product.commission || 0);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-white transition hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(10,42,107,0.08)]">
      <div className="relative aspect-square bg-surface-soft">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width:768px) 50vw, 20vw"
          />
        ) : (
          <div className="grid h-full place-items-center text-xs text-muted">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/partner/marketplace/products/${product.id}`}
            className="min-w-0"
          >
            <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug hover:text-accent">
              {product.name}
            </h3>
            <p className="mt-0.5 truncate text-[11px] text-muted">
              {product.category}
              {product.commission != null
                ? ` · ${product.commission}% commission`
                : ""}
            </p>
          </Link>
          <AffiliateActionButton
            type="product"
            productId={product.id}
            existing={existing}
          />
        </div>
        <div className="mt-auto">
          <p className="display-font text-base font-semibold tracking-tight">
            {formatNaira(price)}
          </p>
          {product.commission != null ? (
            <p className="text-[11px] text-muted">
              You earn ~{formatNaira(earn)} per sale
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function PartnerMarketplacePage() {
  const [tab, setTab] = useState<Tab>("stores");
  const {
    data: storesData,
    error: storesError,
    isLoading: storesLoading,
  } = useListStoresQuery({ limit: 50 });
  const {
    data: productsData,
    error: productsError,
    isLoading: productsLoading,
  } = useListProductsQuery({ limit: 50 });
  const { data: linksData } = useListAffiliateLinksQuery();

  const stores = storesData?.items || [];
  const products = productsData?.items || [];
  const links = linksData?.items || [];

  const linksByStore = useMemo(() => {
    const map = new Map<string, AffiliateLink>();
    links.forEach((link) => {
      if (link.type === "store") map.set(link.store_id, link);
    });
    return map;
  }, [links]);

  const linksByProduct = useMemo(() => {
    const map = new Map<string, AffiliateLink>();
    links.forEach((link) => {
      if (link.type === "product" && link.product_id) {
        map.set(link.product_id, link);
      }
    });
    return map;
  }, [links]);

  useEffect(() => {
    if (storesError) toast.error(getErrorMessage(storesError, "Failed to load stores"));
  }, [storesError]);

  useEffect(() => {
    if (productsError)
      toast.error(getErrorMessage(productsError, "Failed to load products"));
  }, [productsError]);

  return (
    <DashboardShell
      title="Marketplace"
      subtitle="Browse active stores and products, then generate a shareable affiliate link."
    >
      <div className="flex gap-2 border-b border-border">
        {(
          [
            { id: "stores", label: "Stores" },
            { id: "products", label: "Products" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "border-b-2 px-4 py-3 text-sm font-semibold transition",
              tab === item.id
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "stores" ? (
        storesLoading ? (
          <div className="flex justify-center py-16">
            <Spinner className="size-8" />
          </div>
        ) : stores.length === 0 ? (
          <EmptyState
            title="No stores yet"
            description="Active merchant stores will appear here for you to promote."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {stores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                existing={
                  findExistingLink(links, "store", store.id) ||
                  linksByStore.get(store.id)
                }
              />
            ))}
          </div>
        )
      ) : productsLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="size-8" />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Active products will appear here for you to promote."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductPromoCard
              key={product.id}
              product={product}
              existing={
                findExistingLink(links, "product", product.id) ||
                linksByProduct.get(product.id)
              }
            />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
