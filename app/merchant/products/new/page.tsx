"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard-shell";
import { ImageUploadField } from "@/components/image-upload-field";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { Select } from "@/components/select";
import { getErrorMessage } from "@/lib/axios";
import {
  useCreateProductsMutation,
  useListProductCategoriesQuery,
  useListStoresQuery,
  useUploadFileMutation,
} from "@/store/api/sell4meApi";

type ProductDraft = {
  id: string;
  name: string;
  category_id: string;
  unit: string;
  quantity: string;
  price: string;
  commission: string;
  image: string;
  specsText: string;
  uploadingImage: boolean;
};

function createEmptyProductDraft(): ProductDraft {
  return {
    id: crypto.randomUUID(),
    name: "",
    category_id: "",
    unit: "piece",
    quantity: "1",
    price: "",
    commission: "10",
    image: "",
    specsText: "",
    uploadingImage: false,
  };
}

export default function NewProductPage() {
  const router = useRouter();
  const { data: stores, isError } = useListStoresQuery({ limit: 1 });
  const { data: categories } = useListProductCategoriesQuery();
  const [createProducts, { isLoading }] = useCreateProductsMutation();
  const [uploadFile] = useUploadFileMutation();
  const storeId = stores?.items[0]?.id || "";
  const [products, setProducts] = useState<ProductDraft[]>([createEmptyProductDraft()]);

  useEffect(() => {
    if (isError) toast.error("Create a store before adding products");
  }, [isError]);

  const updateProduct = (id: string, updater: (current: ProductDraft) => ProductDraft) => {
    setProducts((current) =>
      current.map((product) => (product.id === id ? updater(product) : product)),
    );
  };

  const anyUploading = products.some((product) => product.uploadingImage);

  return (
    <DashboardShell
      title="Add products"
      subtitle="Add one or more products in a single submission. Commission is a percentage of price (0–100) paid to partners on attributed sales."
    >
      <form
        className="surface-card max-w-2xl space-y-4 p-6 sm:p-7"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!storeId) {
            toast.error("Create a store first");
            return;
          }
          try {
            await createProducts({
              store_id: storeId,
              products: products.map((product) => {
                const specifications: Record<string, string> = {};
                product.specsText
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .forEach((line) => {
                    const [key, ...rest] = line.split(":");
                    if (key && rest.length) {
                      specifications[key.trim()] = rest.join(":").trim();
                    }
                  });

                return {
                  name: product.name,
                  category_id: product.category_id,
                  unit: product.unit,
                  quantity: Number(product.quantity),
                  price: Number(product.price),
                  commission: Number(product.commission),
                  image: product.image || undefined,
                  specifications:
                    Object.keys(specifications).length > 0
                      ? specifications
                      : undefined,
                };
              }),
            }).unwrap();
            toast.success(
              products.length === 1 ? "Product created" : `${products.length} products created`,
            );
            router.push("/merchant/products");
          } catch (err) {
            toast.error(getErrorMessage(err, "Create failed"));
          }
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Products</p>
            <p className="text-sm text-muted">
              Fill in one or more product cards before submitting.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setProducts((current) => [...current, createEmptyProductDraft()])}
          >
            Add another product
          </Button>
        </div>

        {products.map((product, index) => {
          const selectedCategory = categories?.items?.find(
            (category) => category.id === product.category_id,
          );

          return (
            <div
              key={product.id}
              className="rounded-2xl border border-border/70 bg-white/80 p-5 shadow-sm"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    Product {index + 1}
                  </h3>
                  <p className="text-sm text-muted">
                    Add the product details, image, and specifications.
                  </p>
                </div>
                {products.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      setProducts((current) =>
                        current.filter((currentProduct) => currentProduct.id !== product.id),
                      )
                    }
                  >
                    Remove
                  </Button>
                ) : null}
              </div>

              <div className="space-y-4">
                <Field label="Name">
                  <Input
                    required
                    value={product.name}
                    onChange={(e) =>
                      updateProduct(product.id, (current) => ({
                        ...current,
                        name: e.target.value,
                      }))
                    }
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Category">
                    <Select
                      required
                      placeholder="Select category"
                      value={product.category_id}
                      onChange={(e) =>
                        updateProduct(product.id, (current) => ({
                          ...current,
                          category_id: e.target.value,
                        }))
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
                      value={product.unit}
                      onChange={(e) =>
                        updateProduct(product.id, (current) => ({
                          ...current,
                          unit: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Quantity">
                    <Input
                      required
                      type="number"
                      min={0}
                      value={product.quantity}
                      onChange={(e) =>
                        updateProduct(product.id, (current) => ({
                          ...current,
                          quantity: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Price (₦)">
                    <Input
                      required
                      type="number"
                      min={0}
                      value={product.price}
                      onChange={(e) =>
                        updateProduct(product.id, (current) => ({
                          ...current,
                          price: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Commission %">
                    <Input
                      required
                      type="number"
                      min={0}
                      max={100}
                      value={product.commission}
                      onChange={(e) =>
                        updateProduct(product.id, (current) => ({
                          ...current,
                          commission: e.target.value,
                        }))
                      }
                    />
                  </Field>
                </div>
                <Field label="Image">
                  <ImageUploadField
                    value={product.image}
                    uploading={product.uploadingImage}
                    instruction="Use a clear product image with a plain background for the best results."
                    onFileSelect={async (file) => {
                      try {
                        updateProduct(product.id, (current) => ({
                          ...current,
                          uploadingImage: true,
                        }));
                        const uploaded = await uploadFile({
                          endpoint: "/uploads",
                          file,
                        }).unwrap();
                        updateProduct(product.id, (current) => ({
                          ...current,
                          image: uploaded.file_url,
                          uploadingImage: false,
                        }));
                        toast.success(`Image uploaded for product ${index + 1}`);
                      } catch (err) {
                        updateProduct(product.id, (current) => ({
                          ...current,
                          uploadingImage: false,
                        }));
                        toast.error(getErrorMessage(err, "Upload failed"));
                      }
                    }}
                  />
                </Field>
                <Field
                  label="Specifications"
                  hint="One per line as Key: Value"
                >
                  <Textarea
                    value={product.specsText}
                    onChange={(e) =>
                      updateProduct(product.id, (current) => ({
                        ...current,
                        specsText: e.target.value,
                      }))
                    }
                    placeholder={"Color: Blue\nWeight: 500g"}
                  />
                </Field>
              </div>
            </div>
          );
        })}

        <Button disabled={isLoading || !storeId || anyUploading}>
          {isLoading
            ? "Saving…"
            : products.length === 1
              ? "Create product"
              : `Create ${products.length} products`}
        </Button>
      </form>
    </DashboardShell>
  );
}
