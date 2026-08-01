"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Link2,
  LogOut,
  Package,
  Store,
  Wallet,
  LayoutDashboard,
  ShoppingBag,
  Menu,
  X,
} from "lucide-react";
import { HeartbeatLoader } from "@/components/app-loader";
import { BrandLockup } from "@/components/brand";
import { Button } from "@/components/ui";
import {
  useLazyMeQuery,
  useUnreadNotificationCountQuery,
} from "@/store/api/sell4meApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearSession, hydrateAuth } from "@/store/slices/authSlice";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

function navFor(role: Role, isAdmin = false) {
  if (role === "partner") {
    const links = [
      { href: "/partner", label: "Dashboard", icon: LayoutDashboard },
      { href: "/partner/links", label: "Affiliate links", icon: Link2 },
      { href: "/partner/orders", label: "Orders", icon: ShoppingBag },
      { href: "/partner/wallet", label: "Wallet", icon: Wallet },
    ];
    return isAdmin ? links.filter((link) => !link.href.endsWith("/wallet")) : links;
  }
  const links = [
    { href: "/merchant", label: "Dashboard", icon: LayoutDashboard },
    { href: "/merchant/store", label: "Store", icon: Store },
    { href: "/merchant/products", label: "Products", icon: Package },
    { href: "/merchant/orders", label: "Orders", icon: ShoppingBag },
    { href: "/merchant/notifications", label: "Notifications", icon: Bell },
    { href: "/merchant/wallet", label: "Wallet", icon: Wallet },
  ];
  return isAdmin ? links.filter((link) => !link.href.endsWith("/wallet")) : links;
}

function SidebarNav({
  links,
  pathname,
  unread,
}: {
  links: ReturnType<typeof navFor>;
  pathname: string;
  unread: number;
}) {
  return (
    <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2">
      {links.map((link) => {
        const Icon = link.icon;
        const active =
          pathname === link.href ||
          (link.href !== "/merchant" &&
            link.href !== "/partner" &&
            pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "mx-1 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition active:scale-[0.98]",
              active
                ? "bg-secondary-container text-on-secondary-container"
                : "text-muted hover:bg-surface-high hover:text-foreground",
            )}
          >
            <Icon className="size-5 shrink-0" />
            <span className="flex-1">{link.label}</span>
            {link.href.includes("notifications") && unread > 0 ? (
              <span
                className={cn(
                  "grid min-w-5 place-items-center rounded-full px-1 text-[10px] font-semibold",
                  active
                    ? "bg-on-secondary-container text-white"
                    : "bg-brand text-white",
                )}
              >
                {unread}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({
  children,
  title,
  subtitle,
  action,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, hydrated } = useAppSelector((s) => s.auth);
  const [triggerMe, meQuery] = useLazyMeQuery();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: unreadData } = useUnreadNotificationCountQuery(undefined, {
    skip: !user || (user.role !== "merchant" && user.role !== "admin"),
    pollingInterval: 30000,
  });
  const unread = unreadData?.unread_count || 0;
  const authChecking =
    !hydrated ||
    meQuery.isUninitialized ||
    meQuery.isLoading ||
    meQuery.isFetching;

  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!hydrated) return;
    void triggerMe();
  }, [hydrated, triggerMe]);

  useEffect(() => {
    if (authChecking) return;
    if (!user) {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (
      user.role === "admin" &&
      (pathname.startsWith("/merchant/wallet") ||
        pathname.startsWith("/partner/wallet"))
    ) {
      router.replace(pathname.startsWith("/partner") ? "/partner" : "/merchant");
      return;
    }
    const expected = pathname.startsWith("/partner") ? "partner" : "merchant";
    if (user.role !== expected && user.role !== "admin") {
      router.replace(user.role === "partner" ? "/partner" : "/merchant");
    }
  }, [authChecking, user, pathname, router]);

  if (authChecking || !user) {
    return <HeartbeatLoader label="Preparing your dashboard…" />;
  }

  const isAdmin = user.role === "admin";
  const links = navFor(
    isAdmin
      ? pathname.startsWith("/partner")
        ? "partner"
        : "merchant"
      : user.role,
    isAdmin,
  );

  const homeHref = pathname.startsWith("/partner") ? "/partner" : "/merchant";

  const sidebarBody = (
    <>
      <div className="mb-8 px-4">
        <BrandLockup href={homeHref} />
      </div>

      <SidebarNav links={links} pathname={pathname} unread={unread} />

      <div className="mt-auto border-t border-outline-variant px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-full bg-brand text-sm font-bold text-white">
            {user.first_name?.[0]}
            {user.last_name?.[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {user.first_name} {user.last_name}
            </p>
            <p className="truncate text-[11px] font-medium uppercase tracking-wider text-muted">
              {isAdmin ? "Admin" : `Verified ${user.role}`}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="mt-3 w-full justify-start"
          onClick={() => {
            dispatch(clearSession());
            router.push("/");
          }}
        >
          <LogOut className="size-4" />
          Sign out
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-outline-variant bg-surface-soft py-10 lg:flex">
        {sidebarBody}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-navy/25 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex h-screen w-72 flex-col border-r border-outline-variant bg-surface-soft py-6 shadow-[0_4px_12px_rgba(10,42,107,0.08)]">
            <button
              className="mb-3 ml-auto mr-4 grid size-9 place-items-center rounded-full hover:bg-surface-high"
              onClick={() => setMobileOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="size-4" />
            </button>
            {sidebarBody}
          </aside>
        </div>
      ) : null}

      <section className="flex min-h-screen min-w-0 flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-outline-variant bg-white px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              className="grid size-10 place-items-center rounded-full hover:bg-surface-high lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="size-5 text-brand" />
            </button>
            <h1 className="display-font text-xl font-bold tracking-tight text-brand sm:text-2xl">
              {title}
            </h1>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            {user.role === "merchant" || user.role === "admin" ? (
              <Link
                href="/merchant/notifications"
                className="relative grid size-10 place-items-center rounded-full hover:bg-surface-high"
              >
                <Bell className="size-5 text-muted" />
                {unread > 0 ? (
                  <span className="absolute right-2 top-2 size-2 rounded-full bg-danger" />
                ) : null}
              </Link>
            ) : null}
            <div className="h-8 w-px bg-outline-variant" />
            <div className="text-right">
              <p className="text-sm font-semibold">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-[11px] text-muted capitalize">{user.role}</p>
            </div>
            <div className="grid size-10 place-items-center rounded-full bg-brand text-sm font-bold text-white ring-2 ring-outline-variant ring-offset-2">
              {user.first_name?.[0]}
              {user.last_name?.[0]}
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-5 py-8 sm:px-8 lg:px-10">
          {(subtitle || action) && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              {subtitle ? (
                <p className="max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                  {subtitle}
                </p>
              ) : (
                <span />
              )}
              {action}
            </div>
          )}
          {children}
        </div>
      </section>
    </div>
  );
}
