"use client";

import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button, EmptyState, Field, Input } from "@/components/ui";
import { Select } from "@/components/select";
import { getErrorMessage } from "@/lib/axios";
import {
  useCreateAffiliateLinkMutation,
  useListAffiliateLinksQuery,
} from "@/store/api/sell4meApi";

export default function PartnerLinksPage() {
  const { data, error } = useListAffiliateLinksQuery();
  const [createLink, { isLoading }] = useCreateAffiliateLinkMutation();
  const items = data?.items || [];
  const [copied, setCopied] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: "product" as "product" | "store",
    store_id: "",
    product_id: "",
  });

  useEffect(() => {
    if (error) toast.error(getErrorMessage(error, "Failed to load links"));
  }, [error]);

  return (
    <DashboardShell
      title="Affiliate links"
      subtitle="Share /shop/{code} links. First add-to-cart captures attribution."
    >
      <form
        className="surface-card grid gap-4 p-6 sm:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await createLink({
              type: form.type,
              store_id: form.store_id || undefined,
              product_id:
                form.type === "product" ? form.product_id || undefined : undefined,
            }).unwrap();
            toast.success("Link created");
            setForm({ type: "product", store_id: "", product_id: "" });
          } catch (err) {
            toast.error(getErrorMessage(err, "Create failed"));
          }
        }}
      >
        <Field label="Link type">
          <Select
            value={form.type}
            onChange={(e) =>
              setForm({
                ...form,
                type: e.target.value as "product" | "store",
              })
            }
          >
            <option value="product">Product</option>
            <option value="store">Store</option>
          </Select>
        </Field>
        <Field label="Store ID">
          <Input
            required
            value={form.store_id}
            onChange={(e) => setForm({ ...form, store_id: e.target.value })}
            placeholder="Mongo store id"
          />
        </Field>
        {form.type === "product" ? (
          <Field label="Product ID">
            <Input
              required
              value={form.product_id}
              onChange={(e) => setForm({ ...form, product_id: e.target.value })}
              placeholder="Mongo product id"
            />
          </Field>
        ) : null}
        <div className="flex items-end">
          <Button disabled={isLoading}>
            {isLoading ? "Creating…" : "Create link"}
          </Button>
        </div>
      </form>

      {items.length === 0 ? (
        <EmptyState
          title="No links yet"
          description="Create a product or store affiliate link to start sharing."
        />
      ) : (
        <div className="space-y-3">
          {items.map((link) => (
            <div
              key={link.id}
              className="flex flex-col gap-3 surface-card p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold capitalize">
                  {link.type} link · {link.code}
                </p>
                <p className="mt-1 break-all text-sm text-muted">{link.link_url}</p>
                <p className="mt-1 text-xs text-muted">{link.clicks} clicks</p>
              </div>
              <Button
                variant="secondary"
                onClick={async () => {
                  await navigator.clipboard.writeText(link.link_url);
                  setCopied(link.id);
                  toast.success("Copied");
                  setTimeout(() => setCopied(null), 1500);
                }}
              >
                {copied === link.id ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                Copy
              </Button>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
