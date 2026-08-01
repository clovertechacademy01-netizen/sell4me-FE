"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "brand";
};

type ConfirmState = ConfirmOptions & {
  open: boolean;
};

type Resolver = (value: boolean) => void;

let resolver: Resolver | null = null;
let setConfirmState: ((state: ConfirmState) => void) | null = null;

const closedState: ConfirmState = {
  open: false,
  title: "",
  description: "",
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  tone: "danger",
};

export function confirmAction(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    resolver = resolve;
    setConfirmState?.({
      open: true,
      title: options.title,
      description: options.description,
      confirmLabel: options.confirmLabel || "Confirm",
      cancelLabel: options.cancelLabel || "Cancel",
      tone: options.tone || "danger",
    });
  });
}

function settle(value: boolean) {
  resolver?.(value);
  resolver = null;
  setConfirmState?.(closedState);
}

export function ConfirmDialogHost() {
  const [state, setState] = useState<ConfirmState>(closedState);

  useEffect(() => {
    setConfirmState = setState;
    return () => {
      setConfirmState = null;
    };
  }, []);

  useEffect(() => {
    if (!state.open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") settle(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state.open]);

  if (!state.open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-navy/35 backdrop-blur-sm"
        aria-label="Dismiss confirmation"
        onClick={() => settle(false)}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby={
          state.description ? "confirm-dialog-description" : undefined
        }
        className="relative w-full max-w-md overflow-hidden rounded-xl border border-border bg-white shadow-[0_16px_40px_rgba(10,42,107,0.16)]"
      >
        <div className="flex gap-4 p-6">
          <span
            className={cn(
              "mt-0.5 grid size-11 shrink-0 place-items-center rounded-lg",
              state.tone === "danger"
                ? "bg-[#ffdad6] text-danger"
                : "bg-brand-soft text-brand",
            )}
          >
            <AlertTriangle className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2
              id="confirm-dialog-title"
              className="display-font text-lg font-bold tracking-tight text-foreground"
            >
              {state.title}
            </h2>
            {state.description ? (
              <p
                id="confirm-dialog-description"
                className="mt-2 text-sm leading-relaxed text-muted"
              >
                {state.description}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-border bg-surface-soft/70 px-6 py-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => settle(false)}
          >
            {state.cancelLabel}
          </Button>
          <Button
            type="button"
            variant={state.tone === "danger" ? "danger" : "primary"}
            onClick={() => settle(true)}
          >
            {state.confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
