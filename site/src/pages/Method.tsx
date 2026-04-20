import SiteHeader from "../components/SiteHeader";
import PageIntro from "../components/layout/PageIntro";
import Section from "../components/layout/Section";

const steps = [
  {
    label: "01",
    title: "Group videos into topics",
    text: "Instead of judging one video at a time, VidCluster groups related videos into a single topic so the bigger pattern is easier to see.",
  },
  {
    label: "02",
    title: "Track how each topic moves",
    text: "Each topic is followed over time to see whether it fades quickly or keeps building week after week.",
  },
  {
    label: "03",
    title: "Focus on what keeps growing",
    text: "Topics that continue to build are treated differently from those that get a short burst of attention and disappear.",
  },
  {
    label: "04",
    title: "Rank topics by real momentum",
    text: "The goal is to surface topics with more room to grow, not just topics that jumped fastest at the start.",
  },
];

const principles = [
  {
    title: "Looks at topics, not isolated uploads",
    text: "A single video can spike for random reasons. A topic becomes more interesting when multiple related videos begin moving together.",
  },
  {
    title: "Tracks growth over time",
    text: "VidCluster watches what happens next, so it can tell the difference between a brief spike and something that keeps building.",
  },
  {
    title: "Built for better timing",
    text: "The point is to help creators act earlier, before a topic becomes obvious and crowded.",
  },
];

const notVidCluster = [
  "Not a keyword tool",
  "Not a thumbnail or title optimizer",
  "Not based on guessing what might go viral next",
];

export default function Method() {
  return (
    <main className="min-h-screen bg-[#060708] text-white selection:bg-white/20 selection:text-white">
      <SiteHeader />

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_24%),radial-gradient(circle_at_60%_18%,rgba(120,120,145,0.08),transparent_20%),linear-gradient(to_bottom,#0b0c0f_0%,#07080a_45%,#050607_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.025]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.35))]" />
      </div>

      <Section spacing="intro">
        <PageIntro
          label="Method"
          title="How VidCluster works"
          description="VidCluster helps you find YouTube topics that are starting to grow - by tracking how topics move over time, not just individual videos."
        >
          <p className="max-w-2xl text-[1rem] leading-8 text-white/46">
            Built to focus on what keeps building, not what spikes briefly.
          </p>
        </PageIntro>
      </Section>

      <Section bleed spacing="none" className="border-y border-white/8 bg-white/[0.018]">
        <div className="mx-auto grid w-full max-w-[1440px] gap-6 px-6 py-6 lg:grid-cols-3 lg:px-8">
          <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/36">
              The core idea
            </div>
            <div className="mt-3 text-xl font-medium text-white/92">
              Most tools look at videos. VidCluster looks at topics.
            </div>
            <p className="mt-2 text-sm leading-6 text-white/56">
              Instead of reacting to one upload, VidCluster looks at groups of
              related videos so you can see whether a bigger topic is starting
              to build.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/36">
              Why it matters
            </div>
            <div className="mt-3 text-xl font-medium text-white/92">
              Not all early attention leads to real opportunity.
            </div>
            <p className="mt-2 text-sm leading-6 text-white/56">
              Some topics spike quickly and fade. Others grow more quietly and
              keep building. VidCluster is designed to find the second kind.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/36">
              What this helps with
            </div>
            <div className="mt-3 text-xl font-medium text-white/92">
              Better timing for topic selection
            </div>
            <p className="mt-2 text-sm leading-6 text-white/56">
              The goal is to help creators move earlier, before a topic becomes
              obvious and crowded.
            </p>
          </div>
        </div>
      </Section>

      <Section spacing="large">
        <div className="max-w-3xl">
          <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
            The process
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
            A simple way to think about it
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">
            The system behind VidCluster is sophisticated, but the core flow is
            straightforward.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.label}
              className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.014))] p-6 lg:p-7"
            >
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/34">
                {step.label}
              </div>
              <h3 className="mt-5 text-2xl font-medium tracking-[-0.03em] text-white/94">
                {step.title}
              </h3>
              <p className="mt-4 leading-7 text-white/56">{step.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section spacing="standard">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2.25rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.026),rgba(255,255,255,0.014))] p-8 lg:p-10">
            <div className="max-w-3xl">
              <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
                What this means for creators
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
                You are not reacting to what is already obvious.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">
                VidCluster is designed to help you notice topics while they are
                still developing - before they become saturated by competition.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {principles.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.75rem] border border-white/8 bg-white/[0.02] p-6"
                >
                  <div className="text-xl font-medium text-white/92">
                    {item.title}
                  </div>
                  <p className="mt-3 leading-7 text-white/56">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2.25rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.026),rgba(255,255,255,0.014))] p-8 lg:p-10">
            <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
              What VidCluster is not
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
              Not another YouTube optimization tool.
            </h2>

            <div className="mt-8 space-y-4">
              {notVidCluster.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.25rem] border border-white/8 bg-black/20 px-4 py-4 text-sm leading-6 text-white/62"
                >
                  {item}
                </div>
              ))}
            </div>

            <p className="mt-8 leading-7 text-white/56">
              VidCluster is built to help you choose better topics earlier -
              not to optimize a video after the topic is already chosen.
            </p>
          </div>
        </div>
      </Section>

      <Section spacing="large">
        <div className="rounded-[2.25rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.026),rgba(255,255,255,0.014))] p-8 lg:p-10">
          <div className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
              Validation
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
              The approach is tested on what happened later.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">
              VidCluster is tested by fixing topic selections in advance and
              then measuring how those topics actually perform later. That helps
              show whether the early signal holds over time.
            </p>
          </div>
        </div>
      </Section>

      <Section
        bleed
        spacing="none"
        className="border-t border-white/8 bg-white/[0.018]"
      >
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-start justify-between gap-8 px-6 py-16 lg:flex-row lg:items-end lg:px-8">
          <div className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
              Next step
            </div>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.05em] sm:text-6xl sm:leading-[0.98]">
              See how this works in practice.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">
              Explore the research or join early access to see how VidCluster
              can support your content strategy.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href="/research"
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-white/90 transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              View Research
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Join Early Access
            </a>
          </div>
        </div>
      </Section>
    </main>
  );
}
