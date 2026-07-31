"use client";

import Link from "next/link";
import { BrandLockup } from "@/components/brand";
import { FadeIn } from "@/components/motion";
import { cn } from "@/lib/utils";

export function AuthShell({
  title,
  description,
  children,
  footer,
  wide,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-brand/8 blur-3xl" />
        <div className="absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-navy/5 blur-3xl" />
      </div>

      <FadeIn
        className={cn(
          "w-full rounded-xl border border-border bg-white p-7 sm:p-9",
          wide ? "max-w-lg" : "max-w-md",
        )}
      >
        <BrandLockup />
        <h1 className="mt-6 display-font text-2xl font-bold tracking-tight">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
        ) : null}
        <div className="mt-8">{children}</div>
        {footer ? (
          <div className="mt-6 text-center text-sm text-muted">{footer}</div>
        ) : (
          <p className="mt-6 text-center text-sm text-muted">
            <Link href="/" className="font-semibold text-brand hover:underline">
              Back to Sell4Me
            </Link>
          </p>
        )}
      </FadeIn>
    </div>
  );
}
