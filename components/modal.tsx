"use client";

import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  title,
  description,
  children,
  footer,
  onClose,
  size = "md",
}: {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  size?: "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-brand-strong/40 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-modal-title"
        className={cn(
          "relative flex max-h-[min(88vh,840px)] w-full flex-col overflow-hidden rounded-xl border border-border bg-white shadow-[0_16px_40px_rgba(11,61,46,0.16)]",
          size === "lg" ? "max-w-2xl" : "max-w-lg",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div className="min-w-0">
            <h2
              id="app-modal-title"
              className="display-font text-lg font-bold capitalize tracking-tight"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-muted">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-surface-high hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer ? (
          <div className="flex flex-col-reverse gap-2 border-t border-border bg-surface-soft/70 px-6 py-4 sm:flex-row sm:justify-end">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
