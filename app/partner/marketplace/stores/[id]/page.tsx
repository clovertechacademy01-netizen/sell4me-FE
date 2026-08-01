"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Copy, Link2, Loader2, Store as StoreIcon } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard-shell";
import { EmptyState, Spinner } from "@/components/ui";
import { getErrorMessage } from "@/lib/axios";
import {
  useCreateAffiliateLinkMutation,
  useGetStoreQuery,
  useListAffiliateLinksQuery,
} from "@/store/api/sell4meApi";

export default function PartnerStoreDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetStoreQuery(params.id, {
    skip: !params.id,
  });
  const { data: linksData } = useListAffiliateLinksQuery();
  const [createLink, { isLoading: generating }] = useCreateAffiliateLinkMutation();
  const [copied, setCopied] = useState(false);

  const store = data?.store;
  const existing = linksData?.items?.find(
    (link) => link.type === "store" && link.store_id === params.id,
  );
  const [link, setLink] = useState(existing);

  useEffect(() => {
    setLink(existing);
  }, [existing]);

  useEffect(() => {
    if (error) toast.error(getErrorMessage(error, "Failed to load store"));
  }, [error]);

  const onGenerate = async () => {
    try {
      const res = await createLink({
        type: "store",
        store_id: params.id,
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

  return (
    <DashboardShell
      title={store?.name || "Store"}
      subtitle="Store details from the marketplace."
    >
      <Link
        href="/partner/marketplace"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-brand"
      >
        <ArrowLeft className="size-4" />
        Back to marketplace
      </Link>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="size-8" />
        </div>
      ) : !store ? (
        <EmptyState
          title="Store unavailable"
          description={error ? getErrorMessage(error, "Store not found") : ""}
        />
      ) : (
        <article className="overflow-hidden rounded-xl border border-border bg-white">
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start">
            <div className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-soft text-brand">
              {store.logo ? (
                <Image
                  src={store.logo}
                  alt={store.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <StoreIcon className="size-8" />
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="display-font text-2xl font-semibold tracking-tight">
                    {store.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    {store.product_category}
                    {store.business_line ? ` · ${store.business_line}` : ""}
                  </p>
                </div>
                {link?.link_url ? (
                  <button
                    type="button"
                    onClick={onCopy}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-brand hover:bg-brand-soft"
                  >
                    {copied ? (
                      <Check className="size-4" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                    Copy link
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onGenerate}
                    disabled={generating}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-60"
                  >
                    {generating ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Link2 className="size-4" />
                    )}
                    Generate link
                  </button>
                )}
              </div>
              <p className="text-sm leading-relaxed text-muted">
                {store.description}
              </p>
            </div>
          </div>
        </article>
      )}
    </DashboardShell>
  );
}
