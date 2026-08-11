"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Copy, Link2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard-shell";
import { EmptyState, Spinner } from "@/components/ui";
import { getErrorMessage } from "@/lib/axios";
import { formatNaira, partnerEarning } from "@/lib/utils";
import {
  useCreateAffiliateLinkMutation,
  useGetProductQuery,
  useListAffiliateLinksQuery,
} from "@/store/api/sell4meApi";

export default function PartnerProductDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetProductQuery(params.id, {
    skip: !params.id,
  });
  const { data: linksData } = useListAffiliateLinksQuery();
  const [createLink, { isLoading: generating }] = useCreateAffiliateLinkMutation();
  const [copied, setCopied] = useState(false);

  const product = data?.product;
  const existing = linksData?.items?.find(
    (link) => link.type === "product" && link.product_id === params.id,
  );
  const [link, setLink] = useState(existing);

  useEffect(() => {
    setLink(existing);
  }, [existing]);

  useEffect(() => {
    if (error) toast.error(getErrorMessage(error, "Failed to load product"));
  }, [error]);

  const onGenerate = async () => {
    try {
      const res = await createLink({
        type: "product",
        product_id: params.id,
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

  const price = product ? Number(product.price || 0) : 0;
  const earn = product
    ? partnerEarning(price, product.commission || 0)
    : 0;

  return (
    <DashboardShell
      title={product?.name || "Product"}
      subtitle="Product details from the marketplace."
    >
      <Link
        href="/partner/marketplace"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-accent"
      >
        <ArrowLeft className="size-4" />
        Back to marketplace
      </Link>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="size-8" />
        </div>
      ) : !product ? (
        <EmptyState
          title="Product unavailable"
          description={
            error ? getErrorMessage(error, "Product not found") : ""
          }
        />
      ) : (
        <article className="overflow-hidden rounded-xl border border-border bg-white">
          <div className="grid gap-0 md:grid-cols-[280px_1fr]">
            <div className="relative aspect-[4/3] bg-surface-soft md:aspect-auto md:min-h-[280px]">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 280px"
                />
              ) : (
                <div className="grid h-full min-h-[200px] place-items-center text-sm text-muted">
                  No image
                </div>
              )}
            </div>
            <div className="space-y-4 p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="display-font text-2xl font-semibold tracking-tight">
                    {product.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    {product.category}
                    {product.commission != null
                      ? ` · ${product.commission}% commission`
                      : ""}
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
                    Copy Link
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
                    Generate Link
                  </button>
                )}
              </div>
              <p className="display-font text-3xl font-semibold tracking-tight">
                {formatNaira(price)}
              </p>
              {product.commission != null ? (
                <p className="text-sm text-muted">
                  You earn ~{formatNaira(earn)} per sale ({product.commission}%
                  of list price)
                </p>
              ) : null}
              {product.specifications &&
              Object.keys(product.specifications).length > 0 ? (
                <dl className="grid gap-2 border-t border-border pt-4 text-sm">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-4">
                      <dt className="text-muted">{key}</dt>
                      <dd className="text-right font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          </div>
        </article>
      )}
    </DashboardShell>
  );
}
