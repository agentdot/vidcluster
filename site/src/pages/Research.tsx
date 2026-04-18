import SiteHeader from "../components/SiteHeader";

const proofStats = [
  { label: "Tracked clusters", value: "30" },
  { label: "Evaluation window", value: "T+60" },
  { label: "Precision@5", value: "1.0 vs 0.4" },
  { label: "Overlap@5", value: "4 vs 1" },
];

const comparisonRows = [
  {
    model: "Baseline approach",
    pattern: "Favored short-term spikes",
    result: "Precision@5 = 0.4",
    note: "Lower alignment with the strongest later outcomes.",
  },
  {
    model: "VidCluster direction",
    pattern: "Favored persistence",
    result: "Precision@5 = 1.0",
    note: "Stronger alignment with the top-performing topics at T+60.",
  },
];

const takeaways = [
  {
    title: "Persistence matters",
    text: "The better-performing direction was not the one that chased the fastest early movement. It was the one that treated continuation more seriously.",
  },
  {
    title: "Ranking quality improved",
    text: "In the same evaluation window, VidCluster matched more of the strongest later outcomes in the top-ranked positions.",
  },
  {
    title: "This is the real point",
    text: "The system is not trying to celebrate every spike. It is trying to improve topic selection quality under real evaluation conditions.",
  },
];

export default function Research() {
  return (
    <main className="min-h-screen bg-[#060708] text-white selection:bg-white/20 selection:text-white">
      <SiteHeader />

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_24%),radial-gradient(circle_at_60%_18%,rgba(120,120,145,0.08),transparent_20%),linear-gradient(to_bottom,#0b0c0f_0%,#07080a_45%,#050607_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.025]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.35))]" />
      </div>

        <section className="mx-auto w-full max-w-[1304px] px-6 pb-16 pt-16 lg:pb-20 lg:pt-24">

        <div className="max-w-4xl">
          <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
            Research
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.06em] sm:text-6xl sm:leading-[0.96]">
            VidCluster favored persistence over spikes in a real T+60 evaluation.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
            This evaluation tested whether persistence-based signals align better with real outcomes than early spikes.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {proofStats.map((item) => (
            <div
              key={item.label}
              className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5"
            >
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/36">
                {item.label}
              </div>
              <div className="mt-3 text-2xl font-medium tracking-[-0.04em] text-white/94">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/8 bg-white/[0.018]">
        <div className="mx-auto grid w-full max-w-[1304px] gap-6 px-6 py-6 lg:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/36">
              What was tested
            </div>
            <div className="mt-3 text-xl font-medium text-white/92">
              Competing ways of ranking topics
            </div>
            <p className="mt-2 text-sm leading-6 text-white/56">
              The evaluation compared different ranking directions on the same tracked
              topic universe and the same outcome window.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/36">
              What improved
            </div>
            <div className="mt-3 text-xl font-medium text-white/92">
              Better top-rank alignment
            </div>
            <p className="mt-2 text-sm leading-6 text-white/56">
              VidCluster matched more of the strongest later outcomes in the top-ranked
              positions than the baseline direction.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/36">
              Why it matters
            </div>
            <div className="mt-3 text-xl font-medium text-white/92">
              Fewer false positives
            </div>
            <p className="mt-2 text-sm leading-6 text-white/56">
              The system becomes more useful when it reduces excitement around weak
              spikes and pays more attention to continuation.
            </p>
            <div className="mt-3 text-xl font-medium text-white/92">
              What this means
            </div>
            <p className="mt-2 text-sm leading-6 text-white/56">
              Not all early growth signals lead to sustained performance.
              This evaluation shows that persistence-based signals aligned more closely with stronger outcomes than short-term spikes.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1304px] px-6 py-20">
        <div className="max-w-3xl">
          <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
            Comparison
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
            Same universe. Same horizon. Different result quality.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">
            This is the core result: a persistence-led direction produced stronger
            top-ranked alignment than a spike-favoring baseline.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-[1.75rem] border border-white/8">
          <div className="grid grid-cols-4 border-b border-white/8 bg-white/[0.03] text-[11px] uppercase tracking-[0.22em] text-white/42">
            <div className="px-5 py-4">Model</div>
            <div className="border-l border-white/8 px-5 py-4">Favored</div>
            <div className="border-l border-white/8 px-5 py-4">Result</div>
            <div className="border-l border-white/8 px-5 py-4">Interpretation</div>
          </div>

          {comparisonRows.map((row) => (
            <div
              key={row.model}
              className="grid grid-cols-4 border-b border-white/8 last:border-b-0"
            >
              <div className="px-5 py-5 text-white/88">{row.model}</div>
              <div className="border-l border-white/8 px-5 py-5 text-white/60">
                {row.pattern}
              </div>
              <div className="border-l border-white/8 px-5 py-5 text-white/92">
                {row.result}
              </div>
              <div className="border-l border-white/8 px-5 py-5 text-white/56">
                {row.note}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1304px] px-6 py-4">
        <div className="rounded-[2.25rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.026),rgba(255,255,255,0.014))] p-8 lg:p-10">
          <div className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
              What this means in plain English
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
              The strongest signal was not speed alone.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {takeaways.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.75rem] border border-white/8 bg-white/[0.02] p-6"
              >
                <div className="text-xl font-medium text-white/92">{item.title}</div>
                <p className="mt-3 leading-7 text-white/56">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1304px] px-6 py-20">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
              Credibility
            </div>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
              The result matters because the evaluation was locked before the outcome window.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">
              VidCluster is built around reviewable evidence. If you want the method
              behind the signal, explore how the system evaluates topic growth over time.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href="/method"
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-white/90 transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              View Method
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Join Early Access
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}