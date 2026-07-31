"use client";

import { usePathname } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/site-shell";

export function MarketingChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (!isLanding) {
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
