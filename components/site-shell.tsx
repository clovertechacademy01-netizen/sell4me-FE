"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Store, Handshake, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLockup } from "@/components/brand";
import { Button } from "@/components/ui";
import { useGetCartQuery } from "@/store/api/sell4meApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { hydrateAuth } from "@/store/slices/authSlice";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const cart = useAppSelector((s) => s.cart.cart);
  useGetCartQuery();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const count = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const dashboardHref =
    user?.role === "partner"
      ? "/partner"
      : user?.role === "merchant" || user?.role === "admin"
        ? "/merchant"
        : "/auth/login";

  const links = [
    { href: "/#how-it-works", label: "How it works" },
    { href: "/track-delivery", label: "Track order" },
    { href: "/auth/register", label: "Sell or earn" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant bg-white">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            className="grid size-10 place-items-center rounded-full text-brand transition hover:bg-surface-high md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <BrandLockup />
        </div>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="relative grid size-10 place-items-center rounded-lg text-brand transition hover:bg-surface-high"
            aria-label={`Cart${count > 0 ? `, ${count} items` : ""}`}
          >
            <ShoppingBag className="size-5" />
            {count > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full border-2 border-white bg-danger px-1 text-[10px] font-semibold text-white">
                {count > 99 ? "99+" : count}
              </span>
            ) : null}
          </Link>

          {count > 0 ? (
            <Link href="/checkout" className="hidden sm:block">
              <Button size="sm">Checkout</Button>
            </Link>
          ) : null}

          {user ? (
            <Link href={dashboardHref} className="hidden sm:block">
              <Button size="sm" variant="secondary">
                {user.role === "partner" ? (
                  <Handshake className="size-4" />
                ) : (
                  <Store className="size-4" />
                )}
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/auth/login" className="hidden sm:block">
              <Button size="sm" variant={count > 0 ? "secondary" : "primary"}>
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div
        className={cn(
          "border-t border-border bg-white md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <div className="container-page flex flex-col gap-3 py-4">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-muted">
              {link.label}
            </Link>
          ))}
          {count > 0 ? (
            <Link href="/checkout">
              <Button className="w-full">Checkout ({count})</Button>
            </Link>
          ) : null}
          <Link href={user ? dashboardHref : "/auth/login"}>
            <Button className="w-full" variant={count > 0 ? "secondary" : "primary"}>
              {user ? "Dashboard" : "Sign in"}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto w-full shrink-0 border-t border-border bg-surface-soft">
      <div className="container-page grid gap-10 py-16 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <BrandLockup href="/" />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
            Connecting trusted Nigerian merchants with customers through secure
            partner links.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Quick links</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-muted">
            <Link href="/auth/register?role=merchant" className="hover:text-brand">
              Start selling
            </Link>
            <Link href="/auth/register?role=partner" className="hover:text-brand">
              Partner program
            </Link>
            <Link href="/track-delivery" className="hover:text-brand">
              Track order
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Support</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-muted">
            <Link href="/auth/login" className="hover:text-brand">
              Sign in
            </Link>
            <Link href="/cart" className="hover:text-brand">
              Your cart
            </Link>
            <Link href="/#how-it-works" className="hover:text-brand">
              How it works
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="container-page py-5 text-xs text-muted">
          © {new Date().getFullYear()} Sell4Me Limited. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
