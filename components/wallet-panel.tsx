"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button, Field, Input, Spinner } from "@/components/ui";
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
  const { data: walletData, error: walletError, isLoading: walletLoading } =
    useGetWalletQuery();
  const { data: txData } = useListWalletTransactionsQuery({ limit: 20 });
  const { data: banksData, isLoading: banksLoading, error: banksError } =
    useListBanksQuery("NG");
  const [transferFunds, { isLoading: transferring }] =
    useTransferFundsMutation();
  const [verifyBankAccount, { isLoading: verifying }] =
    useVerifyBankAccountMutation();

  const [accountName, setAccountName] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [form, setForm] = useState({
    bank_code: "",
    account_number: "",
    amount: "",
    narration: "Sell4Me withdrawal",
  });
  const verifyRequestId = useRef(0);

  const wallet = walletData?.wallet ?? null;
  const txs = txData?.items || [];
  const banks = useMemo(() => {
    const list = banksData?.data;
    if (!Array.isArray(list)) return [] as Bank[];
    return list
      .filter((bank) => bank?.code && bank?.name)
      .map((bank) => ({ code: String(bank.code), name: String(bank.name) }));
  }, [banksData]);

  const selectedBank = banks.find((bank) => bank.code === form.bank_code);
  const canVerify =
    form.bank_code.length > 0 && /^\d{10}$/.test(form.account_number);
  const accountVerified = Boolean(accountName) && !verifyError;

  useEffect(() => {
    if (walletError)
      toast.error(getErrorMessage(walletError, "Failed to load wallet"));
  }, [walletError]);

  useEffect(() => {
    if (banksError)
      toast.error(getErrorMessage(banksError, "Failed to load banks"));
  }, [banksError]);

  useEffect(() => {
    setAccountName("");
    setVerifyError("");

    if (!canVerify) return;

    const requestId = ++verifyRequestId.current;
    const timer = window.setTimeout(async () => {
      try {
        const res = await verifyBankAccount({
          bank_code: form.bank_code,
          account_number: form.account_number,
        }).unwrap();

        if (requestId !== verifyRequestId.current) return;

        const name = res.account_name?.trim();
        if (!name) {
          setVerifyError("Could not resolve account name");
          setAccountName("");
          return;
        }

        setAccountName(name);
        setVerifyError("");
      } catch (err) {
        if (requestId !== verifyRequestId.current) return;
        setAccountName("");
        setVerifyError(getErrorMessage(err, "Account verification failed"));
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [canVerify, form.bank_code, form.account_number, verifyBankAccount]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-xl bg-brand p-6 text-white shadow-[0_8px_24px_rgba(0,102,255,0.2)]">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <p className="relative text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
            Total balance
          </p>
          <p className="relative mt-3 display-font text-4xl font-bold tracking-tight">
            {walletLoading ? "…" : formatNaira(wallet?.balance || 0)}
          </p>
          <p className="relative mt-3 text-sm text-white/80">
            Pending payouts {formatNaira(wallet?.pending_balance || 0)}
          </p>
        </div>

        <form
          className="surface-card space-y-3 p-6"
          onSubmit={async (e) => {
            e.preventDefault();

            if (!accountVerified) {
              toast.error("Verify the bank account before withdrawing");
              return;
            }

            const amount = Number(form.amount);
            if (!Number.isFinite(amount) || amount < 100) {
              toast.error("Minimum withdrawal is ₦100");
              return;
            }

            try {
              const res = await transferFunds({
                bank_code: form.bank_code,
                account_number: form.account_number,
                amount,
                currency: "NGN",
                narration: form.narration || "Sell4Me withdrawal",
              }).unwrap();
              toast.success(
                res.message ||
                  `Withdrawal initiated${res.transfer_reference ? ` · ${res.transfer_reference}` : ""}`,
              );
              setForm((prev) => ({ ...prev, amount: "" }));
            } catch (err) {
              toast.error(getErrorMessage(err, "Transfer failed"));
            }
          }}
        >
          <div>
            <h3 className="display-font font-semibold tracking-tight">
              Withdraw to bank
            </h3>
            <p className="mt-1 text-xs text-muted">
              Choose a bank, verify the account number, then withdraw.
            </p>
          </div>

          <Field label="Bank">
            {banksLoading ? (
              <div className="flex h-11 items-center gap-2 text-sm text-muted">
                <Spinner className="size-4" />
                Loading banks…
              </div>
            ) : (
              <Select
                required
                value={form.bank_code}
                placeholder="Select bank"
                options={banks.map((bank) => ({
                  value: bank.code,
                  label: bank.name,
                  description: `Code · ${bank.code}`,
                }))}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, bank_code: e.target.value }))
                }
              />
            )}
          </Field>

          <Field
            label="Account number"
            hint="10-digit NUBAN. Verification runs automatically after you select a bank."
          >
            <Input
              required
              inputMode="numeric"
              maxLength={10}
              value={form.account_number}
              placeholder="0123456789"
              onChange={(e) => {
                const account_number = e.target.value.replace(/\D/g, "").slice(0, 10);
                setForm((prev) => ({ ...prev, account_number }));
              }}
            />
          </Field>

          {verifying ? (
            <p className="flex items-center gap-2 text-sm text-muted">
              <Spinner className="size-4" />
              Verifying account…
            </p>
          ) : null}

          {accountName ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-800">
                Verified account
              </p>
              <p className="mt-0.5 font-semibold text-emerald-900">{accountName}</p>
              {selectedBank ? (
                <p className="mt-0.5 text-xs text-emerald-800/80">
                  {selectedBank.name} · {form.account_number}
                </p>
              ) : null}
            </div>
          ) : null}

          {verifyError ? (
            <p className="text-sm text-danger">{verifyError}</p>
          ) : null}

          <Field label="Amount (min ₦100)">
            <Input
              required
              type="number"
              min={100}
              step="1"
              value={form.amount}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, amount: e.target.value }))
              }
            />
          </Field>

          <Field label="Narration">
            <Input
              value={form.narration}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, narration: e.target.value }))
              }
            />
          </Field>

          <Button
            className="w-full"
            disabled={transferring || !accountVerified || verifying}
          >
            {transferring ? "Sending…" : "Withdraw"}
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
                    tx.type === "credit"
                      ? "font-semibold text-success"
                      : "font-semibold"
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
