import { cn } from "@/lib/utils";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

type NativeSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  children?: ReactNode;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "accent" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-[0.01em] transition duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]",
        size === "sm" && "h-9 px-3.5 text-sm",
        size === "md" && "h-11 px-4 text-sm",
        size === "lg" && "h-12 px-6 text-[15px]",
        variant === "primary" &&
          "bg-brand text-white shadow-sm hover:bg-brand-strong active:bg-brand-strong",
        variant === "accent" &&
          "bg-accent text-white shadow-[0_8px_24px_rgba(255,122,69,0.28)] hover:bg-accent-strong active:bg-accent-strong",
        variant === "secondary" &&
          "border border-brand bg-white text-brand hover:bg-brand-soft",
        variant === "ghost" &&
          "text-muted hover:bg-surface-high hover:text-foreground",
        variant === "danger" && "bg-danger text-white hover:bg-red-700",
        className,
      )}
      {...props}
    />
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-lg border border-outline-variant bg-white px-4 text-sm outline-none transition placeholder:text-muted/65 focus:border-accent focus:ring-2 focus:ring-accent/20",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-lg border border-outline-variant bg-white px-4 py-3 text-sm outline-none transition placeholder:text-muted/65 focus:border-accent focus:ring-2 focus:ring-accent/20",
        className,
      )}
      {...props}
    />
  );
}

export function NativeSelect({
  className,
  ...props
}: NativeSelectProps) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-lg border border-outline-variant bg-white px-4 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20",
        className,
      )}
      {...props}
    />
  );
}

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "mb-1.5 block text-sm font-semibold tracking-[0.01em] text-muted",
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {hint ? (
        <p className="mt-1.5 text-xs leading-[1.6] tracking-[0.01em] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Badge({
  children,
  tone = "brand",
}: {
  children: ReactNode;
  tone?: "brand" | "accent" | "success" | "warning" | "danger" | "neutral";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        tone === "brand" && "bg-brand-soft text-brand-strong",
        tone === "accent" && "bg-accent-soft text-accent-strong",
        tone === "success" && "bg-brand-soft text-brand-strong",
        tone === "warning" && "bg-accent-soft text-accent-strong",
        tone === "danger" && "bg-[#ffdad6] text-[#93000a]",
        tone === "neutral" && "bg-surface-high text-muted",
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="surface-card px-6 py-16 text-center">
      <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand">
        <span className="display-font text-lg font-bold">S4</span>
      </div>
      <h3 className="display-font text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
        {description}
      </p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block size-5 animate-spin rounded-full border-2 border-brand/20 border-t-accent",
        className,
      )}
    />
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = false,
  meta,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: boolean;
  meta?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-6 transition hover:-translate-y-0.5",
        accent
          ? "border-transparent bg-accent text-white shadow-[0_8px_24px_rgba(255,122,69,0.28)]"
          : "border-border bg-white hover:shadow-[0_4px_12px_rgba(11,61,46,0.08)]",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "grid size-12 place-items-center rounded-lg",
            accent ? "bg-white/20 text-white" : "bg-brand/10 text-brand",
          )}
        >
          <Icon className="size-5" />
        </span>
      </div>
      <p
        className={cn(
          "mt-5 text-xs font-semibold uppercase tracking-[0.14em]",
          accent ? "text-white/80" : "text-muted",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-2 truncate display-font text-3xl font-bold tracking-tight",
          accent ? "text-white" : "text-foreground",
        )}
      >
        {value}
      </p>
      {meta ? (
        <p className={cn("mt-2 text-sm", accent ? "text-white/80" : "text-muted")}>
          {meta}
        </p>
      ) : null}
    </div>
  );
}
