import type { Metadata } from "next";
import { Bricolage_Grotesque, Work_Sans } from "next/font/google";
import { AppLoader } from "@/components/app-loader";
import { MarketingChrome } from "@/components/marketing-chrome";
import { AppProviders } from "@/components/providers";
import "./globals.css";

const body = Work_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sell4Me — Trusted commerce redefined",
    template: "%s · Sell4Me",
  },
  description:
    "Merchants list products, partners share affiliate links, and customers shop without signing up. Pay with Flutterwave and track delivery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${body.variable} ${display.variable} h-full`}
    >
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <AppProviders>
          <MarketingChrome>{children}</MarketingChrome>
          <AppLoader />
        </AppProviders>
      </body>
    </html>
  );
}
