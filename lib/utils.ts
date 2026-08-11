import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Title-case labels from snake_case or lowercase copy. */
export function formatTitle(value: string | undefined | null) {
  return String(value || "")
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatNaira(amount: number | undefined | null) {
  const value = Number(amount ?? 0);
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Customer pays the listed product price only — commission is not added. */
export function customerUnitPrice(price: number, _commissionPercent?: number) {
  return Number(Number(price || 0).toFixed(2));
}

/** Partner earnings estimate from a product's commission % (not a customer surcharge). */
export function partnerEarning(
  price: number,
  commissionPercent: number,
  quantity = 1,
) {
  return Number(
    (
      ((Number(price) * Number(commissionPercent || 0)) / 100) *
      Number(quantity)
    ).toFixed(2),
  );
}

/** @deprecated Use partnerEarning — commission is not charged to customers. */
export function lineCommission(
  price: number,
  commissionPercent: number,
  quantity: number,
) {
  return partnerEarning(price, commissionPercent, quantity);
}

export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;
