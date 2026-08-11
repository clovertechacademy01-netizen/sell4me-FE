"use client";

import Image from "next/image";
import { Ban, Eye, Pencil, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ActionMenu } from "@/components/action-menu";
import { confirmAction } from "@/components/confirm-dialog";
import { ImageUploadField } from "@/components/image-upload-field";
import { Modal } from "@/components/modal";
import { StatusBadge } from "@/components/product-card";
import { Select } from "@/components/select";
import { Button, Field, Input, Spinner, Textarea } from "@/components/ui";
import { getErrorMessage } from "@/lib/axios";
import type { Product } from "@/lib/types";
import { formatNaira } from "@/lib/utils";
import {
  useActivateProductMutation,
  useListProductCategoriesQuery,
  useSuspendProductMutation,
  useUpdateProductMutation,
  useUploadFileMutation,
} from "@/store/api/sell4meApi";

type ModalMode = "view" | "update" | null;

function specsToText(specs?: Record<string, string>) {
  if (!specs) return "";
  return Object.entries(specs)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

function parseSpecs(text: string) {
  const specifications: Record<string, string> = {};
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const [key, ...rest] = line.split(":");
      if (key && rest.length) specifications[key.trim()] = rest.join(":").trim();
    });
  return specifications;
}

export function ProductRowActions({ product }: { product: Product }) {
  const [mode, setMode] = useState<ModalMode>(null);
  const [suspendProduct, { isLoading: suspending }] =
    useSuspendProductMutation();
  const [activateProduct, { isLoading: activating }] =
    useActivateProductMutation();
  const busy = suspending || activating;
  const isActive = product.status === "active";

  const changeStatus = async (next: "suspend" | "activate") => {
    const suspendingProduct = next === "suspend";
    const confirmed = await confirmAction({
      title: suspendingProduct
        ? `Suspend ${product.name}?`
        : `Activate ${product.name}?`,
      description: suspendingProduct
        ? "Shoppers and partners will not see this product until you activate it again."
        : "This product will be visible on your storefront and available for affiliate links.",
      confirmLabel: suspendingProduct ? "Suspend product" : "Activate product",
      cancelLabel: "Cancel",
      tone: suspendingProduct ? "danger" : "brand",
    });
    if (!confirmed) return;
    try {
      await (suspendingProduct
        ? suspendProduct(product.id)
        : activateProduct(product.id)
      ).unwrap();
      toast.success(
        suspendingProduct ? "Product suspended" : "Product activated",
      );
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update product status"));
    }
  };

  return (
    <>
      <ActionMenu
        label={`Actions for ${product.name}`}
        items={[
          {
            id: "view",
            label: "View",
            icon: <Eye className="size-4" />,
            onSelect: () => setMode("view"),
          },
          {
            id: "update",
            label: "Update",
            icon: <Pencil className="size-4" />,
            onSelect: () => setMode("update"),
          },
          {
            id: "suspend",
            label: busy && isActive ? "Suspending…" : "Suspend",
            icon: <Ban className="size-4" />,
            disabled: !isActive || busy,
            tone: "danger",
            onSelect: () => void changeStatus("suspend"),
          },
          {
            id: "activate",
            label: busy && !isActive ? "Activating…" : "Activate",
            icon: <PlayCircle className="size-4" />,
            disabled: isActive || busy,
            onSelect: () => void changeStatus("activate"),
          },
        ]}
      />
      <ProductViewModal
        product={product}
        open={mode === "view"}
        onClose={() => setMode(null)}
        onUpdate={() => setMode("update")}
      />
      <ProductUpdateModal
        product={product}
        open={mode === "update"}
        onClose={() => setMode(null)}
      />
    </>
  );
}

function ProductViewModal({
  product,
  open,
  onClose,
  onUpdate,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const specEntries = Object.entries(product.specifications || {});

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product.name}
      description="Product details"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button type="button" onClick={onUpdate}>
            Update
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="relative aspect-16/10 overflow-hidden rounded-xl bg-surface-soft">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 512px"
            />
          ) : (
            <div className="grid h-full place-items-center text-sm text-muted">
              No image
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={product.status} />
          <span className="text-sm text-muted">{product.category}</span>
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Price</dt>
            <dd className="font-semibold text-accent">
              {formatNaira(product.price)}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Commission</dt>
            <dd className="font-medium">{product.commission ?? 0}%</dd>
          </div>
          <div>
            <dt className="text-muted">Stock</dt>
            <dd className="font-medium">{product.quantity}</dd>
          </div>
          <div>
            <dt className="text-muted">Unit</dt>
            <dd className="font-medium">{product.unit}</dd>
          </div>
        </dl>
        {specEntries.length ? (
          <div>
            <p className="text-sm font-semibold text-muted">Specifications</p>
            <dl className="mt-2 space-y-1.5 text-sm">
              {specEntries.map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4">
                  <dt className="text-muted">{key}</dt>
                  <dd className="text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

function ProductUpdateModal({
  product,
  open,
  onClose,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
}) {
  const { data: categories } = useListProductCategoriesQuery(undefined, {
    skip: !open,
  });
  const [updateProduct, { isLoading }] = useUpdateProductMutation();
  const [uploadFile] = useUploadFileMutation();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [specsText, setSpecsText] = useState("");
  const [form, setForm] = useState({
    name: "",
    category_id: "",
    unit: "",
    quantity: "",
    price: "",
    commission: "",
    image: "",
  });

  useEffect(() => {
    if (!open) return;
    const resolvedCategoryId =
      product.category_id ||
      categories?.items?.find((category) => category.name === product.category)
        ?.id ||
      "";
    setForm({
      name: product.name,
      category_id: resolvedCategoryId,
      unit: product.unit,
      quantity: String(product.quantity),
      price: String(product.price),
      commission: String(product.commission ?? 0),
      image: product.image || "",
    });
    setSpecsText(specsToText(product.specifications));
  }, [open, product, categories]);

  const selectedCategory = categories?.items?.find(
    (category) => category.id === form.category_id,
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Update product"
      description={product.name}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="product-update-form"
            disabled={isLoading || uploadingImage}
          >
            {isLoading ? "Saving…" : "Save Changes"}
          </Button>
        </>
      }
    >
      <form
        id="product-update-form"
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            await updateProduct({
              id: product.id,
              body: {
                name: form.name,
                category_id: form.category_id,
                unit: form.unit,
                quantity: Number(form.quantity),
                price: Number(form.price),
                commission: Number(form.commission),
                image: form.image || undefined,
                specifications: parseSpecs(specsText),
              },
            }).unwrap();
            toast.success("Product updated");
            onClose();
          } catch (err) {
            toast.error(getErrorMessage(err, "Update failed"));
          }
        }}
      >
        <Field label="Name">
          <Input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category">
            <Select
              required
              placeholder="Select category"
              value={form.category_id}
              onChange={(e) =>
                setForm({ ...form, category_id: e.target.value })
              }
              options={(categories?.items || []).map((category) => ({
                value: category.id,
                label: category.name,
                description: category.examples.join(", "),
              }))}
            />
            {selectedCategory?.examples?.length ? (
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Examples: {selectedCategory.examples.join(", ")}
              </p>
            ) : null}
          </Field>
          <Field label="Unit">
            <Input
              required
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
            />
          </Field>
          <Field label="Quantity">
            <Input
              required
              type="number"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </Field>
          <Field label="Price (₦)">
            <Input
              required
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </Field>
          <Field
            label="Commission %"
            hint="Partner share of list price. Customers pay the list price only."
          >
            <Input
              required
              type="number"
              value={form.commission}
              onChange={(e) =>
                setForm({ ...form, commission: e.target.value })
              }
            />
          </Field>
        </div>
        <Field label="Image">
          <ImageUploadField
            value={form.image}
            uploading={uploadingImage}
            instruction="Use a clear product image with a plain background for the best results."
            onFileSelect={async (file) => {
              try {
                setUploadingImage(true);
                const uploaded = await uploadFile({
                  endpoint: "/uploads",
                  file,
                }).unwrap();
                setForm((current) => ({ ...current, image: uploaded.file_url }));
                toast.success("Image uploaded");
              } catch (err) {
                toast.error(getErrorMessage(err, "Upload failed"));
              } finally {
                setUploadingImage(false);
              }
            }}
          />
        </Field>
        <Field label="Specifications">
          <Textarea
            value={specsText}
            onChange={(e) => setSpecsText(e.target.value)}
          />
        </Field>
        {!categories ? (
          <p className="flex items-center gap-2 text-sm text-muted">
            <Spinner className="size-4" />
            Loading categories…
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
