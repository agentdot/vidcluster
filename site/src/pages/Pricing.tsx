import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Explorer",
    price: "£0",
    suffix: "/ month",
    description: "Understand what is happening — at the surface level",
    note: "See trends — but not how to act on them",
    cta: "Start exploring",
    href: "/signup?plan=explorer",
    highlighted: false,
    features: [
      "Top 5 trending clusters",
      "Basic leaderboard view",
      "Limited topic visibility",
      "Preview-only insights",
    ],
  },
  {
    name: "Pro",
    price: "£19",
    suffix: "/ month",
    badge: "Most Popular",
    priceNote: "Early access price · £49 standard price",
    description: "Identify high-growth topics before the crowd",
    note: "Know what to create — and when to act",
    cta: "Unlock full topic intelligence",
    href: "/signup?plan=pro",
    highlighted: true,
    features: [
      "Full leaderboard access",
      "Complete topic breakdown",
      "Why this score intelligence",
      "Recommended Actions",
      "Advanced filtering",
    ],
  },
  {
    name: "Advanced",
    price: "£49",
    suffix: "/ month",
    priceNote: "Early access price · £149 standard price",
    description: "Scale faster with deeper signals and full data access",
    note: "Designed for serious growth operators and teams",
    cta: "Upgrade to Advanced",
    href: "/signup?plan=advanced",
    highlighted: false,
    features: [
      "Everything in Pro",
      "Full cluster universe",
      "Early-stage trend signals",
      "CSV export",
      "Priority feature access",
      "Upcoming: watchlists & alerts",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    suffix: "",
    description: "For organisations that need full integration and scale",
    note: "Built for platforms, agencies, and enterprise teams",
    cta: "Contact us",
    href: "/contact",
    highlighted: false,
    features: [
      "API access coming soon",
      "Custom dashboards",
      "Dedicated support",
      "Team workflows",
    ],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#0B0F17] text-white">
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
            Pricing
          </p>

          <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
            Simple pricing for serious operators
          </h1>

          <p className="mt-6 text-lg leading-8 text-white/65">
            Find YouTube topics before they become saturated — built on real
            experiments and evaluated over time.
          </p>

          <div className="mx-auto mt-8 inline-flex flex-col items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-6 py-4">
            <p className="text-sm font-semibold text-emerald-300">
              Early Access Pricing — locked until public release
            </p>
            <p className="mt-1 text-sm text-white/50">
              Pricing will increase once VidCluster opens to a wider audience.
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={[
                "relative flex flex-col rounded-3xl border p-8 transition",
                plan.highlighted
                  ? "border-emerald-400/50 bg-white/[0.07] shadow-[0_0_50px_rgba(16,185,129,0.18)] lg:-mt-4 lg:mb-4"
                  : "border-white/10 bg-white/[0.035] hover:border-white/20",
              ].join(" ")}
            >
              {plan.badge && (
                <div className="absolute right-6 top-6 rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-black">
                  {plan.badge}
                </div>
              )}

              <h2 className="text-2xl font-semibold">{plan.name}</h2>

              <p className="mt-4 min-h-[56px] text-sm leading-6 text-white/60">
                {plan.description}
              </p>

              <div className="mt-8">
                <span className="text-5xl font-semibold tracking-tight">
                  {plan.price}
                </span>
                {plan.suffix && (
                  <span className="ml-2 text-sm text-white/50">{plan.suffix}</span>
                )}
              </div>

              {plan.priceNote && (
                <p className="mt-3 text-sm text-emerald-300">{plan.priceNote}</p>
              )}

              <p className="mt-5 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
                {plan.note}
              </p>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm text-white/70">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={plan.href}
                className={[
                  "mt-8 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition",
                  plan.highlighted
                    ? "bg-white text-black hover:bg-white/90"
                    : "border border-white/10 text-white hover:bg-white/10",
                ].join(" ")}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        <section className="mt-20 rounded-3xl border border-white/10 bg-white/[0.035] p-8 md:p-10">
          <h2 className="text-2xl font-semibold">Why VidCluster?</h2>

          <div className="mt-8 grid gap-5 md:grid-cols-4">
            {[
              "Identify topics early — before they trend",
              "Avoid saturated niches and wasted effort",
              "Backed by real performance data",
              "Built for decision-making, not guesswork",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <CheckCircle2 className="mb-4 h-5 w-5 text-emerald-400" />
                <p className="text-sm leading-6 text-white/70">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-4xl text-center">
          <p className="text-2xl font-semibold md:text-3xl">
            Most tools show what is already trending.
          </p>
          <p className="mt-4 text-2xl font-semibold text-emerald-300 md:text-3xl">
            VidCluster shows what is growing — before everyone else notices.
          </p>
        </section>

        <section className="mx-auto mt-20 max-w-4xl">
          <h2 className="text-center text-3xl font-semibold">FAQ</h2>

          <div className="mt-10 space-y-4">
            {[
              {
                q: "How is this different from vidIQ or TubeBuddy?",
                a: "VidCluster focuses on topic-level intelligence, not individual videos or keywords. It identifies early growth patterns across clusters of content — not just what is already popular.",
              },
              {
                q: "What does the trend score mean?",
                a: "The trend score reflects sustained growth, consistency, and signal strength over time — not short-term spikes.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. You can cancel your subscription at any time.",
              },
            ].map((faq) => (
              <div
                key={faq.q}
                className="rounded-2xl border border-white/10 bg-white/[0.035] p-6"
              >
                <h3 className="font-semibold">{faq.q}</h3>
                <p className="mt-3 text-sm leading-6 text-white/60">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-10 text-center">
          <h2 className="text-3xl font-semibold">
            Start finding topics before they become saturated
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/60">
            Unlock the full topic intelligence system and start acting before
            the market becomes crowded.
          </p>

          <Link
            to="/signup?plan=pro"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-white/90"
          >
            Unlock full access
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </section>
    </main>
  );
}
