import { redirect } from "next/navigation";

/** Order view/update now happens from the orders table. */
export default function LegacyMerchantOrderPage() {
  redirect("/merchant/orders");
}
