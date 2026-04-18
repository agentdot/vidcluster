import SiteHeader from "../components/SiteHeader";

export default function HomepageV2() {
  const principles = [
    {
      fig: "FIG 0.1",
      title: "Cluster topics",
      description:
        "Group videos into topic structures instead of treating each upload in isolation.",
      graphic: (
        <svg viewBox="0 0 240 180" className="h-full w-full">
          <g fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.1">
            <path d="M120 26 L176 58 L176 122 L120 154 L64 122 L64 58 Z" />
            <path d="M120 46 L157 67 L157 111 L120 132 L83 111 L83 67 Z" />
            <path d="M120 66 L140 78 L140 100 L120 112 L100 100 L100 78 Z" />
            <ellipse cx="120" cy="89" rx="23" ry="9" />
            <path d="M96 89 H144" />
            <path d="M101 95 H139" />
            <path d="M106 101 H134" />
          </g>
        </svg>
      ),
    },
    {
      fig: "FIG 0.2",
      title: "Track persistence",
      description:
        "Measure topic growth week by week to separate spikes from durable continuation.",
      graphic: (
        <svg viewBox="0 0 240 180" className="h-full w-full">
          <g fill="none" strokeWidth="1.1">
            <path
              d="M22 144 H218 M32 32 V154"
              stroke="rgba(255,255,255,0.12)"
            />
            <path
              d="M38 124 C70 124, 82 100, 98 72 S130 30, 154 62 S186 108, 208 108"
              stroke="rgba(255,255,255,0.28)"
            />
            <path
              d="M38 136 C78 132, 102 118, 132 92 S182 54, 208 28"
              stroke="rgba(180,160,255,0.72)"
            />
            <circle cx="208" cy="108" r="4" fill="rgba(255,255,255,0.55)" />
            <circle cx="208" cy="28" r="4" fill="rgba(180,160,255,0.95)" />
          </g>
        </svg>
      ),
    },
    {
      fig: "FIG 0.3",
      title: "Validate outcomes",
      description:
        "Test signals on frozen experiments so results can be reviewed instead of narrated.",
      graphic: (
        <svg viewBox="0 0 240 180" className="h-full w-full">
          <g fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.1">
            <rect x="38" y="38" width="42" height="82" rx="8" />
            <rect x="99" y="24" width="42" height="96" rx="8" />
            <rect x="160" y="56" width="42" height="64" rx="8" />
            <path d="M38 132 H202" stroke="rgba(255,255,255,0.12)" />
            <path d="M59 50 h10" />
            <path d="M120 36 h10" />
            <path d="M181 68 h10" />
          </g>
        </svg>
      ),
    },
  ];

  const comparison = [
    ["Focus on videos", "Focus on topics"],
    ["Detect spikes", "Detect persistence"],
    ["Real-time trend chasing", "Time-validated growth"],
    ["Guesswork-heavy", "Measured outcomes"],
  ];

  return (
    <main className="min-h-screen bg-[#060708] text-white selection:bg-white/20 selection:text-white">
        <SiteHeader/>
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_24%),radial-gradient(circle_at_62%_20%,rgba(120,120,145,0.09),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.015),transparent_30%),linear-gradient(to_bottom,#0b0c0f_0%,#07080a_42%,#050607_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.025]" />
      </div>

      
      <section className="mx-auto grid w-full max-w-[1350px] gap-16 px-6 pb-20 pt-16 lg:grid-cols-[0.9fr_1.1fr] lg:pb-24 lg:pt-24">
        <div className="vc-fade-up flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/56">
            <span className="h-1.5 w-1.5 rounded-full bg-white/72" />
            Evidence-first topic intelligence
          </div>

          <h1 className="max-w-[640px] text-5xl font-semibold leading-[0.94] tracking-[-0.075em] text-white sm:text-6xl xl:text-[4.95rem]">
            See which topics are growing before they become obvious.
          </h1>

          <p className="mt-6 max-w-[520px] text-[1rem] leading-8 text-white/58">
            VidCluster tracks topic growth over time and tests signals against frozen evaluations.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <a
              href="/research"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-medium text-black shadow-[0_10px_30px_rgba(255,255,255,0.08)] transition hover:bg-white/90"
            >
              View Sample Results
            </a>
            <a
              href="#principles"
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.025] px-6 py-3.5 text-sm font-medium text-white/90 transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              How it works
            </a>
          </div>
            
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/48">
            <span>30 tracked clusters</span>
            <span>T+60 evaluation window</span>
            <span>Frozen comparisons</span>
          </div>
        </div>

        <div className="vc-fade-in vc-fade-in-delay-1 relative">
          <div className="absolute inset-0 rounded-[2.2rem] bg-[radial-gradient(circle_at_55%_40%,rgba(140,120,255,0.16),transparent_45%)] blur-3xl" />

          <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.02))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between border-b border-white/8 pb-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/38">
                  Signal view
                </div>
                <div className="mt-1 text-lg font-medium text-white/92">
                  Spike vs persistent growth
                </div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/52">
                Cluster timeline
              </div>
            </div>

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
                    <linearGradient
                      id="persistentLineV3"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
                      <stop
                        offset="100%"
                        stopColor="rgba(168,139,250,0.95)"
                      />
                    </linearGradient>
                    <linearGradient id="spikeLineV3" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
                      <stop
                        offset="100%"
                        stopColor="rgba(120,138,255,0.78)"
                      />
                    </linearGradient>
                  </defs>

                  <path
                    d="M2 80 C 14 80, 20 62, 28 40 S 48 18, 58 34 S 78 54, 98 58"
                    fill="none"
                    stroke="url(#spikeLineV3)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M2 88 C 18 86, 28 80, 42 70 S 68 52, 82 38 S 94 24, 98 18"
                    fill="none"
                    stroke="url(#persistentLineV3)"
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
                    Short-term spike
                  </div>
                  <div className="mt-2 text-sm leading-6 text-white/54">
                    Fast early velocity. Weak continuation.
                  </div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">
                    Persistent growth
                  </div>
                  <div className="mt-2 text-sm leading-6 text-white/54">
                    Slower start. Stronger evidence over time.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="vc-fade-up vc-fade-up-delay-2 border-y border-white/8 bg-white/[0.018]">
        <div className="mx-auto flex w-full max-w-[1350px] flex-col gap-4 px-6 py-5 text-sm text-white/48 lg:flex-row lg:items-center lg:justify-between">
          <span>Built on frozen experiments</span>
          <span>Evaluated over time</span>
          <span>Reproducible by design</span>
        </div>
      </section>

      <section id="principles" className="mx-auto w-full max-w-[1350px] px-6 py-20">
        <div className="max-w-3xl">
          <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
            Method
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
            Three principles behind the system.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">
            Less dashboard noise. More structural signal.
          </p>
        </div>

        
        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {principles.map((item, index) => (
            <div key={item.title} className="relative lg:pr-8">
              {index < principles.length - 1 && (
                <div className="absolute right-0 top-0 hidden h-full w-px bg-white/8 lg:block" />
              )}

              <div className="text-[11px] uppercase tracking-[0.24em] text-white/26">
                {item.fig}
              </div>

              <div className="mt-6 flex h-56 items-center justify-center rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))] p-6">
                {item.graphic}
              </div>

              <h3 className="mt-8 text-2xl font-medium tracking-[-0.03em] text-white/94">
                {item.title}
              </h3>
              <p className="mt-3 max-w-sm leading-7 text-white/48">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      
      <section id="positioning" className="mx-auto w-full max-w-[1350px] px-6 py-10">
        <div className="rounded-[2.25rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.028),rgba(255,255,255,0.015))] p-8 lg:p-10">
          <div className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
              Positioning
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Not a keyword tool. Not a video optimizer.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">
              VidCluster is built to understand topic growth before it becomes
              obvious.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-[1.75rem] border border-white/8">
            <div className="grid grid-cols-2 border-b border-white/8 bg-white/[0.02] text-[11px] uppercase tracking-[0.22em] text-white/42">
              <div className="px-6 py-4">Typical tools</div>
              <div className="border-l border-white/8 px-6 py-4">VidCluster</div>
            </div>

            {comparison.map(([left, right]) => (
              <div
                key={left}
                className="grid grid-cols-2 border-b border-white/8 last:border-b-0"
              >
                <div className="px-6 py-5 text-white/56">{left}</div>
                <div className="border-l border-white/8 px-6 py-5 text-white/92">
                  {right}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1350px] px-6 py-20">
        <div className="rounded-[2.25rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.024),rgba(255,255,255,0.014))] p-8 lg:p-12">
          <div className="max-w-4xl">
            <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
              Philosophy
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
              No hype. No promises. Just evidence.
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/60">
              Every signal should be reviewable. Every claim should face time.
            </p>
          </div>
        </div>
      </section>

      <section id="cta" className="border-t border-white/8 bg-white/[0.018]">
        <div className="mx-auto flex w-full max-w-[1350px] flex-col items-start justify-between gap-8 px-6 py-16 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
              Next step
            </div>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.05em] sm:text-6xl sm:leading-[0.98]">
              Explore how topic growth actually works.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">
              Review the method. See the model. Join early if it fits how you
              think.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href="/research"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-medium text-black transition hover:bg-white/90"
            >
              View sample results
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