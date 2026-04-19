import SiteHeader from "../components/SiteHeader";

export default function Method() {
  const steps = [
    {
      label: "01",
      title: "Cluster topics",
      text: "Videos are grouped into topic structures so the system can evaluate demand at the topic level, not one upload at a time.",
    },
    {
      label: "02",
      title: "Track over time",
      text: "Each topic is observed across time so short-term spikes can be separated from stronger continuation.",
    },
    {
      label: "03",
      title: "Evaluate signals",
      text: "The goal is to review how signals behave across real observation windows, not rely on narrative or one-off screenshots.",
    },
  ];

  const principles = [
    "Topic-level thinking instead of video-level noise",
    "Time matters more than a single moment of attention",
    "Signal quality matters more than dashboard activity",
  ];

  return (
    <main className="min-h-screen bg-[#060708] text-white selection:bg-white/20 selection:text-white">
      <SiteHeader />
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_24%),radial-gradient(circle_at_60%_18%,rgba(120,120,145,0.08),transparent_20%),linear-gradient(to_bottom,#0b0c0f_0%,#07080a_45%,#050607_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.025]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.35))]" />
      </div>

      <section className="mx-auto w-full max-w-[1350px] px-6 pb-12 pt-12 lg:pb-16 lg:pt-16">
        <div className="max-w-3xl">
          <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
            Method
          </div>

          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.06em] sm:text-6xl sm:leading-[0.96]">
            How VidCluster thinks about topic growth.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
            The system is designed to identify stronger topic signals by looking at
            structure, time, and continuation — not just visible momentum.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/48">
          {principles.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section className="border-y border-white/8 bg-white/[0.018]">
        <div className="mx-auto grid w-full max-w-[1304px] gap-6 px-6 py-6 lg:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/36">
              Input
            </div>
            <div className="mt-3 text-xl font-medium text-white/92">
              Related videos become topic structures
            </div>
            <p className="mt-2 text-sm leading-6 text-white/56">
              The system starts by grouping related content into clusters that can be
              observed as a topic, not as isolated uploads.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/36">
              Observation
            </div>
            <div className="mt-3 text-xl font-medium text-white/92">
              Patterns are judged across time
            </div>
            <p className="mt-2 text-sm leading-6 text-white/56">
              A rise only becomes meaningful when it continues. Time helps separate
              durable growth from short-lived excitement.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/36">
              Decision
            </div>
            <div className="mt-3 text-xl font-medium text-white/92">
              The aim is better topic selection
            </div>
            <p className="mt-2 text-sm leading-6 text-white/56">
              VidCluster is not built to produce more noise. It is built to improve
              decision quality.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1304px] px-6 py-20">
        <div className="max-w-3xl">
          <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
            Process
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
            A simple view of the method.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">
            The deeper evaluation logic sits behind the system, but the core flow is
            straightforward.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
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
      </section>

      <section className="mx-auto w-full max-w-[1304px] px-6 py-4">
        <div className="rounded-[2.25rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.026),rgba(255,255,255,0.014))] p-8 lg:p-10">
          <div className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
              What this page is not
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Not a wall of jargon. Not a black box.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">
              Most users do not need every technical detail up front. They need to
              know the system is grounded, deliberate, and capable of distinguishing
              stronger patterns from weaker ones.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.02] p-6">
              <div className="text-xl font-medium text-white/92">
                What matters first
              </div>
              <p className="mt-3 leading-7 text-white/56">
                Does the system help identify more promising topic directions than
                trend-chasing tools?
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.02] p-6">
              <div className="text-xl font-medium text-white/92">
                What matters second
              </div>
              <p className="mt-3 leading-7 text-white/56">
                Can the reasoning behind those signals be explained clearly and
                inspected when needed?
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1304px] px-6 py-20">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
              Next step
            </div>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.05em] sm:text-6xl sm:leading-[0.98]">
              See the research, then decide if the method earns your trust.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">
              Start with the evidence. Explore the process when you want a clearer
              view of how the system works.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href="/research"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-medium text-black transition hover:bg-white/90"
            >
              View Research
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-white/90 transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              Join Early Access
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}