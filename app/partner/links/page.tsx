"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HeartbeatLoader } from "@/components/app-loader";

/** Legacy route — affiliate links are generated from Marketplace cards. */
export default function PartnerLinksRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/partner/marketplace");
  }, [router]);

  return <HeartbeatLoader label="Opening marketplace…" />;
}
