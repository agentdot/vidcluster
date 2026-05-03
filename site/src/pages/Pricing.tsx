import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

import PageShell from "../components/layout/PageShell";

const plans = [
  {
    name: "Explorer",
    price: "£0",
    suffix: "/ month",
    description: "Get a first read on which topics are moving and which deserve attention.",
    note: "Use it to spot signals, not to make final production decisions.",
    cta: "Start scanning signals",
    href: "/signup?plan=explorer",
    highlighted: false,
    features: [
      "See the strongest current topic signals",
      "Compare basic growth direction",
      "Shortlist ideas worth investigating",
      "Preview decision context before upgrading",
    ],
  },
  {
    name: "Pro",
    price: "£39",
    suffix: "/ month",
    badge: "Most Popular",
    priceNote: "Early access pricing",
    description: "Decide which topics to test, scale, or avoid before the market gets crowded.",
    note: "Built for creators and operators who need a clear next move.",
    cta: "Make better topic decisions",
    href: "/signup?plan=pro",
    highlighted: true,
    features: [
      "Know which signals are worth acting on",
      "Separate early opportunity from hype",
      "See why a topic is moving",
      "Get recommended next actions",
      "Filter faster when choosing what to make next",
    ],
  },
  {
    name: "Advanced",
    price: "£149",
    suffix: "/ month",
    priceNote: "Early access pricing",
    description: "Turn topic intelligence into a repeatable planning system for higher-volume teams.",
    note: "For teams making frequent content, research, or market decisions.",
    cta: "Build a decision system",
    href: "/signup?plan=advanced",
    highlighted: false,
    features: [
      "Prioritize topics across a larger universe",
      "Track early, scaling, and high-risk signals",
      "Export decisions for team planning",
      "Build repeatable research workflows",
      "Get priority access to new decision tools",
      "Prepare watchlists and alerts as they roll out",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    suffix: "",
    description: "For teams that need topic intelligence connected to internal strategy and reporting.",
    note: "Best for agencies, media teams, platforms, and research-led organisations.",
    cta: "Discuss enterprise access",
    href: "/contact",
    highlighted: false,
    features: [
      "Align topic decisions across multiple teams",
      "Custom reporting for your market or category",
      "Support for internal planning workflows",
      "Integration roadmap for data and API needs",
    ],
  },
];

export default function PricingPage() {
  return (
    <PageShell className="bg-[#0B0F17]">
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
            Pricing
          </p>

          <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
            Pricing for better topic decisions
          </h1>

          <p className="mt-6 text-lg leading-8 text-white/65">
            Choose the plan that helps you decide what to test, what to scale,
            and what to avoid before attention gets expensive.
          </p>

          <div className="mx-auto mt-8 inline-flex flex-col items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-6 py-4">
            <p className="text-sm font-semibold text-emerald-300">
              Early access pricing
            </p>
            <p className="mt-1 text-sm text-white/50">
              Join while VidCluster is still being shaped with early users.
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
              "Decide what to make before a topic is obvious",
              "Avoid wasting time on crowded or weak signals",
              "Understand why a trend is worth acting on",
              "Turn research into confident next steps",
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
            Most tools show what already happened.
          </p>
          <p className="mt-4 text-2xl font-semibold text-emerald-300 md:text-3xl">
            VidCluster helps you decide what to do next.
          </p>
        </section>

        <section className="mx-auto mt-20 max-w-4xl">
          <h2 className="text-center text-3xl font-semibold">FAQ</h2>

          <div className="mt-10 space-y-4">
            {[
              {
                q: "How is this different from vidIQ or TubeBuddy?",
                a: "VidCluster is built around topic decisions, not keyword checklists. It helps you judge whether a signal is early, scaling, stable, or risky.",
              },
              {
                q: "What does the trend score mean?",
                a: "The score summarizes growth, consistency, and confidence so you can decide whether to test, scale, monitor, or avoid a topic.",
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
            Make the next topic decision with more confidence
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/60">
            Move from guessing what might work to choosing topics with clearer
            evidence, timing, and action context.
          </p>

          <Link
            to="/signup?plan=pro"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-white/90"
          >
            Start making better decisions
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </section>
    </PageShell>
  );
}
