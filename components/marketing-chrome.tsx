"use client";

import { usePathname } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/site-shell";

const MARKETING_ROUTE_PREFIXES = [
  "/shop",
  "/stores",
  "/products",
  "/cart",
  "/checkout",
  "/track-delivery",
];

function isMarketingRoute(pathname: string) {
  if (pathname === "/") return true;
  return MARKETING_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function MarketingChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (!isMarketingRoute(pathname)) {
    return <main className="min-h-full">{children}</main>;
  }

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
