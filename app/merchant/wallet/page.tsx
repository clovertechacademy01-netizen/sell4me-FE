"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { WalletPanel } from "@/components/wallet-panel";

export default function MerchantWalletPage() {
  return (
    <DashboardShell
      title="Wallet"
      subtitle="Merchant payouts credit on delivered orders. Withdraw to your Nigerian bank."
    >
      <WalletPanel />
    </DashboardShell>
  );
}
