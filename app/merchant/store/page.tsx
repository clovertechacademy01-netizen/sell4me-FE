"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard-shell";
import { ImageUploadField } from "@/components/image-upload-field";
import { confirmAction } from "@/components/confirm-dialog";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { getErrorMessage } from "@/lib/axios";
import type { Store } from "@/lib/types";
import {
  useActivateStoreMutation,
  useCreateStoreMutation,
  useDeleteStoreMutation,
  useListStoresQuery,
  useSuspendStoreMutation,
  useUpdateStoreMutation,
  useUploadFileMutation,
} from "@/store/api/sell4meApi";

export default function MerchantStorePage() {
  const { data, error } = useListStoresQuery({ limit: 1 });
  const [createStore, { isLoading: creating }] = useCreateStoreMutation();
  const [updateStore, { isLoading: updating }] = useUpdateStoreMutation();
  const [deleteStore, { isLoading: deleting }] = useDeleteStoreMutation();
  const [suspendStore, { isLoading: suspending }] = useSuspendStoreMutation();
  const [activateStore, { isLoading: activating }] = useActivateStoreMutation();
  const [uploadFile] = useUploadFileMutation();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [store, setStore] = useState<Store | null>(null);
  const [form, setForm] = useState({
    name: "",
    product_category: "",
    description: "",
    business_line: "",
    logo: "",
  });

  useEffect(() => {
    const existing = data?.items[0];
    if (existing) {
      setStore(existing);
      setForm({
        name: existing.name,
        product_category: existing.product_category,
        description: existing.description,
        business_line: existing.business_line,
        logo: existing.logo || "",
      });
    }
  }, [data]);

  useEffect(() => {
    if (error) toast.error(getErrorMessage(error, "Failed to load store"));
  }, [error]);

  const loading =
    creating || updating || deleting || suspending || activating || uploadingLogo;

  return (
    <DashboardShell
      title="Your Store"
      subtitle="Merchants can operate one store on Sell4Me."
      action={
        store ? (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              disabled={loading}
              onClick={async () => {
                try {
                  const res =
                    store.status === "active"
                      ? await suspendStore(store.id).unwrap()
                      : await activateStore(store.id).unwrap();
                  setStore(res.store);
                  toast.success(
                    store.status === "active"
                      ? "Store suspended"
                      : "Store activated",
                  );
                } catch (err) {
                  toast.error(getErrorMessage(err, "Could not update store status"));
                }
              }}
            >
              {store.status === "active" ? "Suspend" : "Activate"}
            </Button>
            <Button
              variant="danger"
              disabled={loading}
              onClick={async () => {
                const confirmed = await confirmAction({
                  title: "Delete this store?",
                  description:
                    "This deletes the store and all of its products. This action cannot be undone.",
                  confirmLabel: "Delete Store",
                  cancelLabel: "Keep Store",
                  tone: "danger",
                });
                if (!confirmed) return;
                try {
                  await deleteStore(store.id).unwrap();
                  setStore(null);
                  setForm({
                    name: "",
                    product_category: "",
                    description: "",
                    business_line: "",
                    logo: "",
                  });
                  toast.success("Store deleted");
                } catch (err) {
                  toast.error(getErrorMessage(err, "Delete failed"));
                }
              }}
            >
              Delete Store
            </Button>
          </div>
        ) : null
      }
    >
      <form
        className="surface-card max-w-2xl space-y-4 p-6 sm:p-7"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            if (store) {
              const res = await updateStore({ id: store.id, body: form }).unwrap();
              setStore(res.store);
              toast.success("Store updated");
            } else {
              const res = await createStore(form).unwrap();
              setStore(res.store);
              toast.success("Store created");
            }
          } catch (err) {
            toast.error(getErrorMessage(err, "Save failed"));
          }
        }}
      >
        <Field label="Store name">
          <Input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Product category">
          <Input
            required
            value={form.product_category}
            onChange={(e) =>
              setForm({ ...form, product_category: e.target.value })
            }
          />
        </Field>
        <Field label="Business line">
          <Input
            required
            value={form.business_line}
            onChange={(e) => setForm({ ...form, business_line: e.target.value })}
          />
        </Field>
        <Field label="Description">
          <Textarea
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>
        <Field label="Logo">
          <ImageUploadField
            value={form.logo}
            uploading={uploadingLogo}
            instruction="Upload a square or wide logo that looks good on light backgrounds."
            onFileSelect={async (file) => {
              try {
                setUploadingLogo(true);
                const uploaded = await uploadFile({
                  endpoint: "/uploads/organization-logo",
                  file,
                }).unwrap();
                setForm((current) => ({ ...current, logo: uploaded.file_url }));
                toast.success("Logo uploaded");
              } catch (err) {
                toast.error(getErrorMessage(err, "Upload failed"));
              } finally {
                setUploadingLogo(false);
              }
            }}
          />
        </Field>
        <Button disabled={loading}>
          {loading ? "Saving…" : store ? "Update Store" : "Create Store"}
        </Button>
      </form>
    </DashboardShell>
  );
}
