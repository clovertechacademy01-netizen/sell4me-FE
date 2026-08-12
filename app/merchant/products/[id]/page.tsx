import { redirect } from "next/navigation";

/** Product view/update now happens from the products table. */
export default function LegacyMerchantProductPage() {
  redirect("/merchant/products");
}
