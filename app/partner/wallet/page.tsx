"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { WalletPanel } from "@/components/wallet-panel";

export default function PartnerWalletPage() {
  return (
    <DashboardShell
      title="Wallet"
      subtitle="Partner commissions credit on delivered attributed orders."
    >
      <WalletPanel />
    </DashboardShell>
  );
}
