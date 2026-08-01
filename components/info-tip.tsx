"use client";

import { CircleHelp } from "lucide-react";
import { cn } from "@/lib/utils";

export function InfoTip({
  label,
  children,
  className,
}: {
  label: string;
  children: string;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-flex items-center", className)}>
      <button
        type="button"
        className="group inline-flex size-5 items-center justify-center rounded-full text-muted transition hover:bg-brand-soft hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        aria-label={label}
        title={children}
      >
        <CircleHelp className="size-3.5" />
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-[calc(100%+0.5rem)] left-1/2 z-20 w-64 -translate-x-1/2 rounded-lg border border-border bg-white p-3 text-left text-xs leading-relaxed text-muted opacity-0 shadow-[0_8px_24px_rgba(10,42,107,0.12)] transition group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          {children}
        </span>
      </button>
    </span>
  );
}
