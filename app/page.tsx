import Link from "next/link";
import {
  ChevronDown,
  Handshake,
  Link2,
  Package,
  Search,
  ShieldCheck,
  Store,
  Truck,
  Wallet,
} from "lucide-react";
import { FadeIn, Reveal } from "@/components/motion";
import { Button } from "@/components/ui";

const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCqwtfNtkvwhtV6ZTEoYtGZUl0ALYZXQfyVk57qSE_8aVCH30iFFK-VzTUNkj8DLhi3n8BqVUMc-tq_7nh4vY2rvLLGA4rAh3JHP8SKD6sMvtWcM_YVcDw_Bk563jZX8oKB_s7MJ2yeEa_U-R3GkCmlULs8os05wgYOO9L0ztbva065-qfj07bskOmoaVjT_NqBQk5jyqTPcqcu92gbsiqYJQezFxQSgYbEkSj1F2g4Q98NMIyJpD8C";

export default function HomePage() {
  return (
    <div>
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
          />
          <div className="hero-overlay absolute inset-0" />
        </div>

        <FadeIn className="relative z-10 flex w-full max-w-[1280px] flex-col items-center px-5 text-center">
          <h1 className="display-font text-4xl font-extrabold uppercase tracking-tighter text-white sm:text-5xl md:text-6xl">
            Sell4Me
          </h1>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            A Product Of X Technologies Limited
          </p>
          <p className="mt-4 max-w-2xl text-base font-medium text-white/90 sm:text-lg md:text-xl">
            Affiliate commerce for Nigeria. Merchants list, partners share
            links, and customers buy as guests — with Flutterwave payment and
            Fez delivery.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/auth/register?role=merchant">
              <Button variant="accent" size="lg" className="min-w-52 px-10">
                Start Selling
              </Button>
            </Link>
            <Link href="/auth/register?role=partner">
              <Button
                size="lg"
                className="min-w-52 border border-white/20 bg-white/10 px-10 text-white backdrop-blur-md hover:bg-white/20"
              >
                Become A Partner
              </Button>
            </Link>
          </div>
        </FadeIn>

        <a
          href="#how-it-works"
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/50 transition hover:text-white"
          aria-label="Scroll To How It Works"
        >
          <ChevronDown className="size-8 animate-bounce" />
        </a>
      </section>

      <section id="how-it-works" className="bg-white py-20">
        <div className="container-page">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="display-font text-3xl font-bold tracking-tight text-brand-strong">
                How It Works
              </h2>
              <p className="mt-3 text-muted">
                From affiliate link to wallet payout — without forcing shoppers
                to create an account.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-12 md:grid-cols-3 md:gap-10">
            {[
              {
                icon: Link2,
                title: "Share A Link",
                body: "Partners generate a unique store or product link. First-touch attribution stays on the guest cart.",
              },
              {
                icon: ShieldCheck,
                title: "Guest Checkout",
                body: "Shoppers pay the listed price plus Fez delivery via Flutterwave. Email is enough — no password or OTP wall.",
              },
              {
                icon: Wallet,
                title: "Settle On Delivery",
                body: "Fez updates status by webhook. When the order is delivered and paid, merchant and partner wallets are credited.",
              },
            ].map((step, i) => (
              <Reveal key={step.title} delay={i * 0.08}>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-6 grid size-16 place-items-center rounded-full bg-secondary-container text-on-secondary-container">
                    <step.icon className="size-8" />
                  </div>
                  <h3 className="display-font text-xl font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="for-you" className="bg-surface-soft py-20">
        <div className="container-page">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="display-font text-3xl font-bold tracking-tight text-brand-strong">
                Built For Every Side Of The Sale
              </h2>
              <p className="mt-3 text-muted">
                One stack connecting merchants, partners, and customers.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {[
              {
                icon: Store,
                title: "Merchants",
                body: "Create a store, list products with stock and commission %, get notified when orders are paid, and withdraw after delivery.",
                href: "/auth/register?role=merchant",
                cta: "Open Your Store",
              },
              {
                icon: Handshake,
                title: "Partners",
                body: "Browse the marketplace, generate affiliate links, and earn net commission on attributed sales once they are delivered.",
                href: "/auth/register?role=partner",
                cta: "Start Earning",
              },
              {
                icon: Package,
                title: "Customers",
                body: "Shop from a public link with no login. Pay listed price plus delivery, choose home or locker, and track with an 8-character code.",
                href: "/track-delivery",
                cta: "Track An Order",
              },
            ].map((role, i) => (
              <Reveal key={role.title} delay={i * 0.08}>
                <div className="flex h-full flex-col">
                  <div className="mb-5 grid size-12 place-items-center rounded-xl bg-brand text-white">
                    <role.icon className="size-6" />
                  </div>
                  <h3 className="display-font text-xl font-semibold tracking-tight">
                    {role.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                    {role.body}
                  </p>
                  <Link href={role.href} className="mt-6 inline-block">
                    <Button variant={i === 1 ? "accent" : "secondary"} size="sm">
                      {role.cta}
                    </Button>
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-white py-20">
        <div className="container-page">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="display-font text-3xl font-bold tracking-tight text-brand-strong">
                Transparent Pricing
              </h2>
              <p className="mt-3 text-muted">
                Customers never pay a commission surcharge. Partner share comes
                from the merchant, not the shopper.
              </p>
            </div>
          </Reveal>

          <div className="mx-auto mt-14 grid max-w-4xl gap-8 sm:grid-cols-3">
            {[
              {
                title: "Listed Price",
                body: "What the customer pays for items. Commission is not added on top.",
              },
              {
                title: "Fez Delivery",
                body: "Live quote for home delivery or locker pickup, plus a clear platform markup.",
              },
              {
                title: "Wallet Payouts",
                body: "Merchant and partner wallets credit only after the order is delivered and paid.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06}>
                <div>
                  <h3 className="display-font text-lg font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="trust" className="bg-background py-20">
        <div className="container-page">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="display-font text-3xl font-bold tracking-tight text-brand-strong">
                Built For Nigerian Commerce
              </h2>
              <p className="mt-3 text-muted">
                Payments, logistics, and alerts that match how people already
                sell.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: ShieldCheck,
                title: "Flutterwave",
                body: "Hosted checkout and bank withdrawals merchants already trust.",
              },
              {
                icon: Truck,
                title: "Fez Delivery",
                body: "Live quotes, door delivery, locker pickup, and webhook status updates.",
              },
              {
                icon: Search,
                title: "Tracking Code",
                body: "An 8-character code in email and WhatsApp to look up delivery anytime.",
              },
              {
                icon: Wallet,
                title: "Naira Wallets",
                body: "Withdraw to a verified Nigerian bank account when funds clear.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.05}>
                <div>
                  <item.icon className="size-6 text-accent" />
                  <h3 className="mt-4 display-font text-lg font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-strong py-20 text-white">
        <div className="container-page">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="display-font text-3xl font-bold tracking-tight">
                Ready To Run Commerce Your Way?
              </h2>
              <p className="mt-4 text-base text-white/75">
                List products, share affiliate links, and get paid when orders
                arrive — whether you sell or promote.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/auth/register?role=merchant">
                  <Button variant="accent" size="lg" className="min-w-48">
                    Start Selling
                  </Button>
                </Link>
                <Link href="/auth/register?role=partner">
                  <Button
                    size="lg"
                    className="min-w-48 border border-white/25 bg-transparent text-white hover:bg-white/10"
                  >
                    Become A Partner
                  </Button>
                </Link>
                <Link href="/track-delivery">
                  <Button
                    size="lg"
                    className="min-w-48 border border-white/25 bg-transparent text-white hover:bg-white/10"
                  >
                    Track An Order
                  </Button>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
