"use client";

import { MoreVertical } from "lucide-react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export type ActionMenuItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  tone?: "default" | "danger";
  onSelect: () => void;
};

export function ActionMenu({
  items,
  label = "Actions",
}: {
  items: ActionMenuItem[];
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const updatePosition = () => {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const menuWidth = menuRef.current?.offsetWidth ?? 176;
    const menuHeight = menuRef.current?.offsetHeight ?? 180;
    const left = Math.min(
      rect.right - menuWidth,
      window.innerWidth - menuWidth - 8,
    );
    const openUp = rect.bottom + menuHeight + 8 > window.innerHeight;
    const top = openUp ? rect.top - menuHeight - 4 : rect.bottom + 4;
    setCoords({
      top: Math.max(8, top),
      left: Math.max(8, left),
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "ml-auto inline-grid size-9 place-items-center rounded-lg text-muted transition",
          open
            ? "bg-brand-soft text-brand"
            : "hover:bg-surface-high hover:text-foreground",
        )}
      >
        <MoreVertical className="size-4" />
      </button>
      {open
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              role="menu"
              style={{ top: coords.top, left: coords.left }}
              className="fixed z-[80] min-w-44 overflow-hidden rounded-xl border border-border bg-white py-1 shadow-[0_8px_24px_rgba(11,61,46,0.12)]"
            >
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    if (item.disabled) return;
                    setOpen(false);
                    item.onSelect();
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm font-medium capitalize transition",
                    item.tone === "danger"
                      ? "text-danger hover:bg-red-50"
                      : "text-foreground hover:bg-surface-soft",
                    item.disabled &&
                      "cursor-not-allowed opacity-40 hover:bg-transparent",
                  )}
                >
                  {item.icon ? (
                    <span className="grid size-4 shrink-0 place-items-center">
                      {item.icon}
                    </span>
                  ) : null}
                  {item.label}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
