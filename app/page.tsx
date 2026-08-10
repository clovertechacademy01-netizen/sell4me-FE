import Link from "next/link";
import { ChevronDown, Search, ShieldCheck, Truck } from "lucide-react";
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
          <p className="mt-4 max-w-2xl text-base font-medium text-white/90 sm:text-lg md:text-xl">
            Experience borderless commerce. Shop from verified local merchants
            through exclusive partner links with guaranteed delivery.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/auth/register?role=merchant">
              <Button variant="accent" size="lg" className="min-w-52 px-10">
                Start selling
              </Button>
            </Link>
            <Link href="/auth/register?role=partner">
              <Button
                size="lg"
                className="min-w-52 border border-white/20 bg-white/10 px-10 text-white backdrop-blur-md hover:bg-white/20"
              >
                Become a partner
              </Button>
            </Link>
          </div>
        </FadeIn>

        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce text-white/50">
          <ChevronDown className="size-8" />
        </div>
      </section>

      <section id="how-it-works" className="bg-white py-20">
        <div className="container-page">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="display-font text-3xl font-bold tracking-tight text-brand-strong">
                How it works
              </h2>
              <p className="mt-3 text-muted">
                Simple, secure, and transparent shopping in three steps.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-12 md:grid-cols-3 md:gap-10">
            {[
              {
                icon: Search,
                title: "Discover",
                body: "Find products through merchant partner links shared across social platforms.",
              },
              {
                icon: ShieldCheck,
                title: "Checkout securely",
                body: "Buy as a guest with Flutterwave — no account required to complete payment.",
              },
              {
                icon: Truck,
                title: "Track delivery",
                body: "Follow your order with Fez tracking until it reaches your door.",
              },
            ].map((step, i) => (
              <Reveal key={step.title} delay={i * 0.08}>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-6 grid size-16 place-items-center rounded-full bg-secondary-container text-on-secondary-container transition group-hover:scale-110">
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

          <div className="mt-16 flex flex-wrap items-center justify-center gap-4">
            <Link href="/auth/register?role=merchant">
              <Button size="lg" variant="accent">
                Start selling
              </Button>
            </Link>
            <Link href="/auth/register?role=partner">
              <Button size="lg" variant="secondary">
                Become a partner
              </Button>
            </Link>
            <Link href="/track-delivery">
              <Button size="lg" variant="ghost">
                Track an order
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
