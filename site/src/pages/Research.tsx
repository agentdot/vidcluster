import SiteHeader from "../components/SiteHeader";

const summaryCards = [
  {
    label: "What improved",
    title: "Better top-topic selection",
    text: "VidCluster surfaced more of the strongest-performing topics near the top of the ranking.",
  },
  {
    label: "Why it matters",
    title: "Less noise from short spikes",
    text: "Short bursts of attention were less likely to be mistaken for real opportunities.",
  },
  {
    label: "What this gives creators",
    title: "Better timing",
    text: "You can focus earlier on topics that keep building, instead of reacting once they are already crowded.",
  },
];

const comparisonRows = [
  {
    method: "Typical spike-based approach",
    focus: "What jumps fastest first",
    outcome: "Lower match with the strongest later topics",
    takeaway: "Good at spotting noise. Weaker at spotting what keeps building.",
  },
  {
    method: "VidCluster approach",
    focus: "What continues to build",
    outcome: "Stronger match with the best later topics",
    takeaway: "Better at surfacing early topics with more room to grow.",
  },
];

const trustPoints = [
  "Predictions were fixed before results were known",
  "No changes were made after outcomes",
  "The same topic set was used across methods",
  "Results were judged on what actually happened later",
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

      <section className="mx-auto w-full max-w-[1350px] px-6 pb-12 pt-12 lg:pb-16 lg:pt-16">
        <div className="max-w-4xl">
          <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
            Research
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.06em] sm:text-6xl sm:leading-[0.96]">
            Real YouTube topic predictions - tested over time.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
            VidCluster identified more of the strongest-performing YouTube topics
            than a typical spike-based approach.
          </p>

          <p className="mt-4 max-w-2xl text-[1rem] leading-8 text-white/46">
            Predictions were fixed in advance, then checked against what actually
            happened later. No edits. No hindsight.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/36">
              Tracked topics
            </div>
            <div className="mt-3 text-2xl font-medium tracking-[-0.04em] text-white/94">
              30
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/36">
              Evaluation window
            </div>
            <div className="mt-3 text-2xl font-medium tracking-[-0.04em] text-white/94">
              60 days
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/36">
              Top-pick accuracy
            </div>
            <div className="mt-3 text-2xl font-medium tracking-[-0.04em] text-white/94">
              Stronger than baseline
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/8 bg-emerald-400/[0.04] p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-300/70">
              Key takeaway
            </div>
            <div className="mt-3 text-2xl font-medium tracking-[-0.04em] text-white">
              Persistence beat spikes
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/8 bg-white/[0.018]">
        <div className="mx-auto grid w-full max-w-[1350px] gap-6 px-6 py-6 lg:grid-cols-3">
          {summaryCards.map((card) => (
            <div
              key={card.title}
              className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5"
            >
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/36">
                {card.label}
              </div>
              <div className="mt-3 text-xl font-medium text-white/92">
                {card.title}
              </div>
              <p className="mt-2 text-sm leading-6 text-white/56">
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1350px] px-6 py-20">
        <div className="max-w-3xl">
          <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
            Why this matters
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
            Not all early growth leads to a real opportunity.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">
            Some YouTube topics get a quick burst of attention and fade. Others
            keep building quietly over time. VidCluster is designed to help
            creators focus on the second kind.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.026),rgba(255,255,255,0.014))] p-6 lg:p-7">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/36">
              Visual proof
            </div>
            <div className="mt-3 text-2xl font-medium tracking-[-0.03em] text-white/94">
              Some topics spike. Others keep growing.
            </div>
            <p className="mt-3 max-w-2xl leading-7 text-white/56">
              Each line below represents a YouTube topic tracked over time. The
              stronger signal is not the one that jumps fastest first. It is the
              one that keeps building.
            </p>

            <div className="mt-6 rounded-[1.7rem] border border-white/8 bg-black/20 p-5">
              <div className="flex items-end justify-between text-[11px] uppercase tracking-[0.18em] text-white/32">
                <span>Week 1</span>
                <span>Week 4</span>
                <span>Week 8</span>
                <span>Week 12</span>
              </div>

              <div className="mt-5 h-72 rounded-[1.35rem] bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_20%,20%_100%] p-4">
                <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
                  <defs>
                    <linearGradient id="researchPersistentLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
                      <stop offset="100%" stopColor="rgba(168,139,250,0.95)" />
                    </linearGradient>
                    <linearGradient id="researchSpikeLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
                      <stop offset="100%" stopColor="rgba(120,138,255,0.78)" />
                    </linearGradient>
                  </defs>

                  <path
                    d="M2 80 C 14 80, 20 62, 28 40 S 48 18, 58 34 S 78 54, 98 58"
                    fill="none"
                    stroke="url(#researchSpikeLine)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M2 88 C 18 86, 28 80, 42 70 S 68 52, 82 38 S 94 24, 98 18"
                    fill="none"
                    stroke="url(#researchPersistentLine)"
                    strokeWidth="2.7"
                    strokeLinecap="round"
                  />
                  <circle cx="98" cy="58" r="2.5" fill="rgba(120,138,255,0.86)" />
                  <circle cx="98" cy="18" r="2.8" fill="rgba(168,139,250,0.96)" />
                </svg>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">
                    Spike topic
                  </div>
                  <div className="mt-2 text-sm leading-6 text-white/54">
                    Gets attention fast, then loses momentum.
                  </div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">
                    Growing topic
                  </div>
                  <div className="mt-2 text-sm leading-6 text-white/54">
                    Starts quieter, then keeps building week after week.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.026),rgba(255,255,255,0.014))] p-6 lg:p-7">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/36">
              Plain-English result
            </div>
            <div className="mt-3 text-2xl font-medium tracking-[-0.03em] text-white/94">
              VidCluster’s top picks matched real outcomes more closely.
            </div>
            <p className="mt-3 leading-7 text-white/56">
              In this evaluation, VidCluster did a better job of placing the
              strongest later topics near the top than a more spike-focused
              ranking style.
            </p>

            <div className="mt-8 space-y-5">
              <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5">
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/36">
                  In simple terms
                </div>
                <p className="mt-3 leading-7 text-white/56">
                  More of the topics that actually performed well later were
                  already near the top of VidCluster’s list.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5">
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/36">
                  Why creators should care
                </div>
                <p className="mt-3 leading-7 text-white/56">
                  Better topic timing means more room to create before the idea
                  becomes obvious and crowded.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/[0.04] p-5">
                <div className="text-[11px] uppercase tracking-[0.2em] text-emerald-300/70">
                  Core insight
                </div>
                <p className="mt-3 leading-7 text-white/70">
                  The strongest signal was not speed alone. It was growth that
                  continued after the first burst of attention.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1350px] px-6 py-4">
        <div className="rounded-[2.25rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.026),rgba(255,255,255,0.014))] p-8 lg:p-10">
          <div className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
              Comparison
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Same topic set. Same time window. Different result quality.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">
              The difference was not whether both approaches found movement. It
              was whether they ranked the stronger later topics near the top.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-[1.75rem] border border-white/8">
            <div className="grid grid-cols-1 border-b border-white/8 bg-white/[0.02] text-[11px] uppercase tracking-[0.22em] text-white/42 md:grid-cols-4">
              <div className="px-5 py-4">Approach</div>
              <div className="border-t border-white/8 px-5 py-4 md:border-l md:border-t-0">
                Focus
              </div>
              <div className="border-t border-white/8 px-5 py-4 md:border-l md:border-t-0">
                Result
              </div>
              <div className="border-t border-white/8 px-5 py-4 md:border-l md:border-t-0">
                Takeaway
              </div>
            </div>

            {comparisonRows.map((row) => (
              <div
                key={row.method}
                className="grid grid-cols-1 border-b border-white/8 last:border-b-0 md:grid-cols-4"
              >
                <div className="px-5 py-5 text-white/88">{row.method}</div>
                <div className="border-t border-white/8 px-5 py-5 text-white/60 md:border-l md:border-t-0">
                  {row.focus}
                </div>
                <div className="border-t border-white/8 px-5 py-5 text-white/92 md:border-l md:border-t-0">
                  {row.outcome}
                </div>
                <div className="border-t border-white/8 px-5 py-5 text-white/56 md:border-l md:border-t-0">
                  {row.takeaway}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1350px] px-6 py-20">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <div className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
              Why you can trust this
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
              The result matters because the test happened before the outcome.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">
              VidCluster is not trying to explain success after the fact. It is
              designed to judge topic movement before the later outcome is known.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/8 bg-white/[0.02] p-6 lg:p-7">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/36">
              Trust checks
            </div>
            <div className="mt-5 space-y-4">
              {trustPoints.map((point) => (
                <div
                  key={point}
                  className="rounded-[1.25rem] border border-white/8 bg-black/20 px-4 py-4 text-sm leading-6 text-white/62"
                >
                  {point}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/8 bg-white/[0.018]">
        <div className="mx-auto flex w-full max-w-[1350px] flex-col items-start justify-between gap-8 px-6 py-16 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
              Next step
            </div>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.05em] sm:text-6xl sm:leading-[0.98]">
              If this matches how you think about YouTube, explore the method or join early.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">
              VidCluster is being built for creators who want clearer timing and
              better topic decisions.
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