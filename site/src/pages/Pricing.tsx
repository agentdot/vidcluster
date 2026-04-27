import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import PageShell from "../components/layout/PageShell";
import Section from "../components/layout/Section";
import Container from "../components/layout/Container";
import PageSeo from "../components/seo/PageSeo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { cn } from "../lib/utils";

const plans = [
  {
    name: "Explorer",
    price: "\u00a30",
    period: "/ month",
    description: "Get a feel for how VidCluster works",
    features: [
      "Limited access to top trending clusters",
      "Basic leaderboard view",
      "Limited detail insights",
      "Delayed data access",
    ],
    cta: "Start exploring",
    href: "/signup?plan=explorer",
  },
  {
    name: "Pro",
    price: "\u00a319",
    period: "/ month",
    badge: "Most Popular",
    description: "For creators and operators who want an edge",
    features: [
      "Full leaderboard access",
      "Complete topic detail view",
      '"Why this score" explanation',
      "Recommended Actions",
      "Advanced filtering",
      "Latest data access",
    ],
    cta: "Get full access",
    href: "/signup?plan=pro",
    featured: true,
  },
  {
    name: "Advanced",
    price: "\u00a349",
    period: "/ month",
    description: "For teams and serious growth operators",
    features: [
      "Everything in Pro",
      "Full cluster universe",
      "Early-stage trend signals",
      "CSV export",
      "Priority access to new features",
      "Future: watchlists and alerts",
    ],
    cta: "Upgrade to Advanced",
    href: "/signup?plan=advanced",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For organisations and platforms",
    features: ["API access future", "Custom dashboards", "Dedicated support"],
    cta: "Contact us",
    href: "/contact",
  },
];

const valueSignals = [
  "Identify topics early",
  "Avoid saturated niches",
  "Evidence-backed signals",
  "Actionable recommendations",
];

const faqs = [
  {
    question: "How is this different from vidIQ or TubeBuddy?",
    answer:
      "VidCluster focuses on topic-level intelligence, not individual videos or keywords. It identifies early growth patterns across clusters of content - not just what is already popular.",
  },
  {
    question: "What does the trend score mean?",
    answer:
      "The trend score reflects sustained growth, consistency, and signal strength over time - not short-term spikes.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes. You can cancel your subscription at any time.",
  },
];

export default function Pricing() {
  return (
    <PageShell
      backgroundLayers={
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.06),transparent_24%),radial-gradient(circle_at_52%_34%,rgba(80,200,140,0.08),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(120,120,145,0.08),transparent_22%),linear-gradient(to_bottom,#0B0F17_0%,#07090d_48%,#050607_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.03]" />
        </>
      }
    >
      <PageSeo
        title="VidCluster Pricing - Topic Intelligence for YouTube Creators"
        description="Simple pricing for serious creators and teams using VidCluster to find YouTube topics before they become saturated."
        url="/pricing"
      />

      <Section spacing="intro" containerClassName="max-w-[1200px]">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/56">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/80" />
            Pricing
          </div>

          <h1 className="text-4xl font-semibold leading-[1.02] tracking-[-0.06em] text-white sm:text-6xl lg:text-[4.5rem]">
            Simple pricing for serious creators and teams
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/62">
            Find YouTube topics before they become saturated - backed by real data
            and evaluated over time.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={cn(
                "relative flex min-h-[560px] flex-col overflow-hidden rounded-[2rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.034),rgba(255,255,255,0.016))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]",
                plan.featured
                  ? "border-emerald-300/28 shadow-[0_24px_90px_rgba(80,200,140,0.12)]"
                  : "border-white/9",
              )}
            >
              {plan.featured ? (
                <>
                  <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent" />
                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-300/12 blur-3xl" />
                </>
              ) : null}

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-medium tracking-[-0.03em] text-white/94">
                    {plan.name}
                  </h2>
                  <p className="mt-3 min-h-[3.5rem] text-sm leading-6 text-white/52">
                    {plan.description}
                  </p>
                </div>

                {plan.badge ? (
                  <span className="shrink-0 rounded-full border border-emerald-300/22 bg-emerald-300/[0.08] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-emerald-200/82">
                    {plan.badge}
                  </span>
                ) : null}
              </div>

              <div className="relative mt-7 flex items-end gap-2">
                <div className="text-4xl font-semibold tracking-[-0.05em] text-white">
                  {plan.price}
                </div>
                {plan.period ? (
                  <div className="pb-1 text-sm text-white/42">{plan.period}</div>
                ) : null}
              </div>

              <Link
                to={plan.href}
                className={cn(
                  "relative mt-7 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition",
                  plan.featured
                    ? "bg-white text-black shadow-[0_14px_34px_rgba(255,255,255,0.10)] hover:bg-white/90"
                    : "border border-white/10 bg-white/[0.03] text-white/82 hover:border-white/18 hover:bg-white/[0.05] hover:text-white",
                )}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>

              <div className="relative mt-8 h-px bg-white/8" />

              <ul className="relative mt-7 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm leading-6 text-white/64">
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                        plan.featured
                          ? "border-emerald-300/24 bg-emerald-300/[0.08] text-emerald-200"
                          : "border-white/10 bg-white/[0.03] text-white/62",
                      )}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section spacing="standard" containerClassName="max-w-[1200px]">
        <div className="overflow-hidden rounded-[2rem] border border-white/9 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.014))] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.24)] lg:p-9">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
                Value
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                Built for decision-making, not guesswork
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {valueSignals.map((signal) => (
                <div
                  key={signal}
                  className="flex items-center gap-3 rounded-[1.2rem] border border-white/8 bg-black/18 px-4 py-4 text-sm text-white/72"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-300/78" />
                  {signal}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section spacing="standard" containerClassName="max-w-[900px]">
        <div className="text-center">
          <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
            FAQ
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
            Questions before you choose a plan
          </h2>
        </div>

        <Accordion type="single" collapsible defaultValue="item-0" className="mt-10 space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.question}
              value={`item-${index}`}
              className="overflow-hidden rounded-[1.35rem] border border-white/8 bg-white/[0.025] px-5"
            >
              <AccordionTrigger className="py-5 text-left text-base text-white/88 hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-base leading-7 text-white/58">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      <Section bleed spacing="none" className="border-t border-white/8 bg-white/[0.018]">
        <Container className="max-w-[1200px] py-16 text-center lg:py-20">
          <div className="mx-auto max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
              Next step
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-6xl sm:leading-[0.98]">
              Start finding topics before they become saturated
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/58">
              Use topic-level signals to choose what to make next with more
              confidence and less reactive guessing.
            </p>

            <Link
              to="/signup?plan=pro"
              className="mt-9 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-medium text-black shadow-[0_12px_34px_rgba(255,255,255,0.08)] transition hover:bg-white/90"
            >
              Get full access
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </Section>
    </PageShell>
  );
}
