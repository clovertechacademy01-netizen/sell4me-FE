"use client";

import { ImageIcon, Upload } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";

type ImageUploadFieldProps = {
  value?: string;
  onFileSelect: (file: File) => void | Promise<void>;
  accept?: string;
  disabled?: boolean;
  uploading?: boolean;
  className?: string;
  instruction?: string;
};

export function ImageUploadField({
  value,
  onFileSelect,
  accept = "image/*",
  disabled,
  uploading,
  className,
  instruction = "PNG, JPG, or WEBP up to 10MB",
}: ImageUploadFieldProps) {
  const inputId = useId();
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const previewSrc = localPreview ?? value ?? "";

  return (
    <div className={cn("space-y-3", className)}>
      <input
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled || uploading}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (localPreview) URL.revokeObjectURL(localPreview);
          const objectUrl = URL.createObjectURL(file);
          setLocalPreview(objectUrl);
          await onFileSelect(file);
          e.currentTarget.value = "";
        }}
      />

      <label
        htmlFor={inputId}
        className={cn(
          "group block cursor-pointer overflow-hidden rounded-xl border border-dashed border-outline-variant bg-white transition",
          "hover:border-brand/40 hover:shadow-[0_4px_12px_rgba(255,122,69,0.08)]",
          "focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20",
          (disabled || uploading) && "cursor-not-allowed opacity-70",
        )}
      >
        {previewSrc ? (
          <div className="relative">
            <img
              src={previewSrc}
              alt="Selected upload preview"
              className="h-56 w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-slate-950/70 via-slate-950/35 to-transparent px-4 pb-4 pt-10 text-white">
              <p className="text-sm font-semibold">
                {uploading ? "Uploading image..." : "Click to replace image"}
              </p>
              <p className="mt-1 text-xs text-white/80">{instruction}</p>
            </div>
          </div>
        ) : (
          <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
            <div className="grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand transition group-hover:scale-[1.03]">
              <Upload className="size-6" />
            </div>
            <p className="mt-4 text-sm font-semibold text-foreground">
              {uploading ? "Uploading image..." : "Upload an image"}
            </p>
            <p className="mt-1 text-sm text-muted">
              Tap to browse and choose an image for this item.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted">{instruction}</p>
          </div>
        )}
      </label>

      {value ? (
        <div className="flex items-center gap-2 text-xs text-muted">
          <ImageIcon className="size-3.5 shrink-0" />
          <span className="truncate">Preview ready</span>
        </div>
      ) : null}
    </div>
  );
}
