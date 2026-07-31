"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button, Field, Input } from "@/components/ui";
import { Select } from "@/components/select";
import { getErrorMessage } from "@/lib/axios";
import { formatNaira } from "@/lib/utils";
import {
  useGetWalletQuery,
  useListBanksQuery,
  useListWalletTransactionsQuery,
  useTransferFundsMutation,
  useVerifyBankAccountMutation,
} from "@/store/api/sell4meApi";

type Bank = { code: string; name: string };

export function WalletPanel() {
  const { data: walletData, error: walletError } = useGetWalletQuery();
  const { data: txData } = useListWalletTransactionsQuery({ limit: 20 });
  const { data: banksData } = useListBanksQuery("NG");
  const [transferFunds, { isLoading }] = useTransferFundsMutation();
  const [verifyBankAccount] = useVerifyBankAccountMutation();
  const [accountName, setAccountName] = useState("");
  const [form, setForm] = useState({
    bank_code: "",
    account_number: "",
    amount: "",
    narration: "Sell4Me withdrawal",
  });

  const wallet = walletData?.wallet ?? null;
  const txs = txData?.items || [];
  const banks = useMemo(() => {
    const b = banksData;
    if (!b) return [] as Bank[];
    if (Array.isArray(b)) return b as Bank[];
    if (Array.isArray((b as { data?: Bank[] }).data)) {
      return (b as { data: Bank[] }).data;
    }
    return [] as Bank[];
  }, [banksData]);

  useEffect(() => {
    if (walletError)
      toast.error(getErrorMessage(walletError, "Failed to load wallet"));
  }, [walletError]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-xl bg-brand p-6 text-white shadow-[0_8px_24px_rgba(0,102,255,0.2)]">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <p className="relative text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
            Total balance
          </p>
          <p className="relative mt-3 display-font text-4xl font-bold tracking-tight">
            {formatNaira(wallet?.balance || 0)}
          </p>
          <p className="relative mt-3 text-sm text-white/80">
            Pending payouts {formatNaira(wallet?.pending_balance || 0)}
          </p>
        </div>
        <form
          className="surface-card space-y-3 p-6"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await transferFunds({
                bank_code: form.bank_code,
                account_number: form.account_number,
                amount: Number(form.amount),
                narration: form.narration,
              }).unwrap();
              toast.success("Withdrawal initiated");
              setForm({ ...form, amount: "" });
            } catch (err) {
              toast.error(getErrorMessage(err, "Transfer failed"));
            }
          }}
        >
          <h3 className="display-font font-semibold tracking-tight">Withdraw to bank</h3>
          <Field label="Bank">
            <Select
              required
              value={form.bank_code}
              onChange={(e) => setForm({ ...form, bank_code: e.target.value })}
            >
              <option value="">Select bank</option>
              {banks.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Account number">
            <Input
              required
              value={form.account_number}
              onChange={async (e) => {
                const account_number = e.target.value;
                setForm({ ...form, account_number });
                setAccountName("");
                if (account_number.length === 10 && form.bank_code) {
                  try {
                    const res = await verifyBankAccount({
                      bank_code: form.bank_code,
                      account_number,
                    }).unwrap();
                    setAccountName(
                      res.data?.account_name || res.account_name || "",
                    );
                  } catch {
                    setAccountName("");
                  }
                }
              }}
            />
          </Field>
          {accountName ? (
            <p className="text-sm font-medium text-success">{accountName}</p>
          ) : null}
          <Field label="Amount (min ₦100)">
            <Input
              required
              type="number"
              min={100}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </Field>
          <Button className="w-full" disabled={isLoading}>
            {isLoading ? "Sending…" : "Withdraw"}
          </Button>
        </form>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="border-b border-border px-5 py-4 display-font font-semibold tracking-tight">
          Recent transactions
        </div>
        <ul className="divide-y divide-border">
          {txs.length === 0 ? (
            <li className="px-5 py-8 text-sm text-muted">No transactions yet.</li>
          ) : (
            txs.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between gap-4 px-5 py-4 text-sm"
              >
                <div>
                  <p className="font-medium capitalize">
                    {tx.category.replaceAll("_", " ")}
                  </p>
                  <p className="text-xs text-muted">{tx.reference}</p>
                </div>
                <p
                  className={
                    tx.type === "credit" ? "font-semibold text-success" : "font-semibold"
                  }
                >
                  {tx.type === "credit" ? "+" : "-"}
                  {formatNaira(tx.amount)}
                </p>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
