"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard-shell";
import { ImageUploadField } from "@/components/image-upload-field";
import { confirmAction } from "@/components/confirm-dialog";
import { Button, Field, Input, Spinner, Textarea } from "@/components/ui";
import { Select } from "@/components/select";
import { getErrorMessage } from "@/lib/axios";
import {
  useActivateProductMutation,
  useDeleteProductMutation,
  useGetProductQuery,
  useListProductCategoriesQuery,
  useSuspendProductMutation,
  useUpdateProductMutation,
  useUploadFileMutation,
} from "@/store/api/sell4meApi";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading: loadingProduct, error } = useGetProductQuery(
    params.id,
    { skip: !params.id },
  );
  const [updateProduct, { isLoading }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [suspendProduct, { isLoading: suspending }] = useSuspendProductMutation();
  const [activateProduct, { isLoading: activating }] = useActivateProductMutation();
  const { data: categories } = useListProductCategoriesQuery();
  const [uploadFile] = useUploadFileMutation();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [ready, setReady] = useState(false);
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
  const selectedCategory = categories?.items?.find(
    (category) => category.id === form.category_id,
  );

  useEffect(() => {
    if (!data?.product) return;
    const p = data.product;
    const resolvedCategoryId =
      p.category_id ||
      categories?.items?.find((category) => category.name === p.category)?.id ||
      "";
    setForm({
      name: p.name,
      category_id: resolvedCategoryId,
      unit: p.unit,
      quantity: String(p.quantity),
      price: String(p.price),
      commission: String(p.commission),
      image: p.image || "",
    });
    setSpecsText(
      p.specifications
        ? Object.entries(p.specifications)
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n")
        : "",
    );
    setReady(true);
  }, [data, categories]);

  useEffect(() => {
    if (error) toast.error(getErrorMessage(error, "Failed to load"));
  }, [error]);

  if (!ready || loadingProduct) {
    return (
      <DashboardShell title="Edit Product">
        <div className="flex justify-center py-16">
          <Spinner className="size-8" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Edit Product"
      action={
        <Button
          variant="secondary"
          disabled={suspending || activating}
          onClick={async () => {
            try {
              await (data?.product.status === "active"
                ? suspendProduct(params.id)
                : activateProduct(params.id)
              ).unwrap();
              toast.success(
                data?.product.status === "active"
                  ? "Product suspended"
                  : "Product activated",
              );
            } catch (err) {
              toast.error(getErrorMessage(err, "Could not update product status"));
            }
          }}
        >
          {data?.product.status === "active" ? "Suspend" : "Activate"}
        </Button>
      }
    >
      <form
        className="surface-card max-w-2xl space-y-4 p-6 sm:p-7"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const specifications: Record<string, string> = {};
            specsText
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean)
              .forEach((line) => {
                const [key, ...rest] = line.split(":");
                if (key && rest.length)
                  specifications[key.trim()] = rest.join(":").trim();
              });
            await updateProduct({
              id: params.id,
              body: {
                name: form.name,
                category_id: form.category_id,
                unit: form.unit,
                quantity: Number(form.quantity),
                price: Number(form.price),
                commission: Number(form.commission),
                image: form.image || undefined,
                specifications,
              },
            }).unwrap();
            toast.success("Product updated");
            router.push("/merchant/products");
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
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
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
              onChange={(e) => setForm({ ...form, commission: e.target.value })}
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
        <div className="flex gap-3">
          <Button disabled={isLoading || uploadingImage}>
            {isLoading ? "Saving…" : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={async () => {
              const confirmed = await confirmAction({
                title: "Delete this product?",
                description:
                  "This permanently removes the product from your storefront. This action cannot be undone.",
                confirmLabel: "Delete product",
                cancelLabel: "Keep product",
                tone: "danger",
              });
              if (!confirmed) return;
              try {
                await deleteProduct(params.id).unwrap();
                toast.success("Deleted");
                router.push("/merchant/products");
              } catch (err) {
                toast.error(getErrorMessage(err, "Delete failed"));
              }
            }}
          >
            Delete
          </Button>
        </div>
      </form>
    </DashboardShell>
  );
}
