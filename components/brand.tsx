import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function LogoMark({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid place-items-center rounded-lg bg-brand font-bold text-white",
        size === "sm" && "size-8 text-xs",
        size === "md" && "size-9 text-sm",
        size === "lg" && "size-11 text-base",
        className,
      )}
    >
      S4
    </span>
  );
}

export function BrandLockup({
  href = "/",
  size = "md",
  subtitle,
  mark = false,
}: {
  href?: string;
  size?: "sm" | "md" | "lg";
  subtitle?: string;
  mark?: boolean;
}) {
  const content = (
    <span className="flex items-center gap-2.5">
      {mark ? <LogoMark size={size} /> : null}
      <span className="min-w-0">
        <span
          className={cn(
            "block display-font font-bold tracking-tight text-brand",
            size === "lg" ? "text-2xl" : size === "sm" ? "text-lg" : "text-xl",
          )}
        >
          Sell4Me
        </span>
        {subtitle ? (
          <span className="block truncate text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} className="inline-flex transition hover:opacity-90">
      {content}
    </Link>
  );
}

export function Surface({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "form";
}) {
  return <Tag className={cn("surface-card", className)}>{children}</Tag>;
}

export function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={cn(
            "display-font text-3xl font-bold tracking-tight text-foreground sm:text-[2rem]",
            eyebrow && "mt-2",
          )}
        >
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-muted sm:text-[15px]">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
