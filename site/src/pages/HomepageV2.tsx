import Container from "../components/layout/Container";
import PageShell from "../components/layout/PageShell";
import Section from "../components/layout/Section";

const steps = [
  {
    number: "01",
    title: "Group related videos into topics",
    text: "Instead of judging one upload at a time, VidCluster looks at groups of related videos so the bigger topic is easier to see.",
  },
  {
    number: "02",
    title: "Track how each topic grows",
    text: "Each topic is followed over time so it becomes easier to separate a brief spike from something that keeps building.",
  },
  {
    number: "03",
    title: "Surface topics with better timing",
    text: "The goal is to help creators notice promising topics earlier - before the opportunity becomes obvious and crowded.",
  },
];

export default function HomepageV2() {
  return (
    <PageShell
      backgroundLayers={
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_24%),radial-gradient(circle_at_62%_20%,rgba(120,120,145,0.09),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.015),transparent_30%),linear-gradient(to_bottom,#0b0c0f_0%,#07080a_42%,#050607_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.025]" />
        </>
      }
    >

      <Section
        spacing="intro"
        containerClassName="grid gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10"
      >
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/56">
            <span className="h-1.5 w-1.5 rounded-full bg-white/72" />
            Understand YouTube topic momentum early
          </div>

          <h1 className="max-w-[700px] text-5xl font-semibold leading-[0.94] tracking-[-0.07em] text-white sm:text-6xl xl:text-[4.95rem]">
            Know which YouTube topics are gaining momentum - before they become obvious.
          </h1>

          <p className="mt-6 max-w-[560px] text-[1.03rem] leading-8 text-white/60">
            VidCluster helps you spot topics that are starting to grow - so you can
            create content before the opportunity gets crowded.
          </p>

          <p className="mt-4 max-w-[620px] text-[0.98rem] leading-8 text-white/46">
            Instead of looking at one video, VidCluster looks at entire topics -
            groups of videos moving together - to spot real growth early.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-medium text-black shadow-[0_10px_30px_rgba(255,255,255,0.08)] transition hover:bg-white/90"
            >
              Join Early Access
            </a>
            <a
              href="/research"
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.025] px-6 py-3.5 text-sm font-medium text-white/90 transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              View Research
            </a>
          </div>

          <div className="mt-6 text-sm text-white/48">
            Built for creators who want better timing, not more noise.
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-[2.2rem] bg-[radial-gradient(circle_at_55%_40%,rgba(140,120,255,0.16),transparent_45%)] blur-3xl" />

          <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.02))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between border-b border-white/8 pb-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/38">
                  Topic cluster growth
                </div>
                <div className="mt-1 text-lg font-medium text-white/92">
                  Short spike vs lasting growth
                </div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/52">
                Cluster timeline
              </div>
            </div>

            <div className="mt-6 rounded-[1.7rem] border border-white/8 bg-black/20 p-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/34">
                Each line = a YouTube topic cluster
              </div>

              <div className="mt-4 flex items-end justify-between text-[11px] uppercase tracking-[0.18em] text-white/32">
                <span>Week 1</span>
                <span>Week 4</span>
                <span>Week 8</span>
                <span>Week 12</span>
              </div>

              <div className="mt-5 h-72 rounded-[1.35rem] bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_20%,20%_100%] p-4">
                <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
                  <defs>
                    <linearGradient id="v3PersistentLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.62)" />
                      <stop offset="100%" stopColor="rgba(80,200,140,0.92)" />
                    </linearGradient>
                    <linearGradient id="v3SpikeLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
                      <stop offset="100%" stopColor="rgba(122,132,178,0.78)" />
                    </linearGradient>
                    <filter id="v3GlowGreen" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="1.8" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <path
                    d="M2 80 C 14 80, 20 62, 28 40 S 48 18, 58 34 S 78 54, 98 58"
                    fill="none"
                    stroke="url(#v3SpikeLine)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    pathLength="100"
                    strokeDasharray="100"
                    strokeDashoffset="100"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="100;0;0;100"
                      dur="8s"
                      repeatCount="indefinite"
                    />
                  </path>

                  <path
                    d="M2 88 C 18 86, 28 80, 42 70 S 68 52, 82 38 S 94 24, 98 18"
                    fill="none"
                    stroke="url(#v3PersistentLine)"
                    strokeWidth="2.7"
                    strokeLinecap="round"
                    filter="url(#v3GlowGreen)"
                    pathLength="100"
                    strokeDasharray="100"
                    strokeDashoffset="100"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="100;0;0;100"
                      dur="8s"
                      begin="0.2s"
                      repeatCount="indefinite"
                    />
                  </path>

                  <text
                    x="73"
                    y="53"
                    fill="rgba(255,255,255,0.42)"
                    fontSize="4"
                    letterSpacing="0.08em"
                  >
                    SPIKE TOPIC
                  </text>

                  <text
                    x="58"
                    y="23"
                    fill="rgba(108,216,158,0.78)"
                    fontSize="4"
                    letterSpacing="0.08em"
                  >
                    GROWING TOPIC
                  </text>

                  <circle cx="98" cy="58" r="2.5" fill="rgba(122,132,178,0.86)">
                    <animate
                      attributeName="opacity"
                      values="0.7;0.95;0.7"
                      dur="4.8s"
                      repeatCount="indefinite"
                    />
                  </circle>

                  <circle cx="98" cy="18" r="2.8" fill="rgba(80,200,140,0.96)" filter="url(#v3GlowGreen)">
                    <animate
                      attributeName="r"
                      values="2.6;3;2.6"
                      dur="4.8s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.82;1;0.82"
                      dur="4.8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </svg>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">
                    Spike topic
                  </div>
                  <div className="mt-2 text-sm leading-6 text-white/54">
                    Attention jumps fast, then fades.
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-4">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-emerald-300/70">
                    Growing topic
                  </div>
                  <div className="mt-2 text-sm leading-6 text-white/68">
                    Starts quieter, then keeps building week after week.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-[1.35rem] border border-white/8 bg-white/[0.02] p-5">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">
              What this shows
            </div>
            <p className="mt-3 max-w-[34rem] text-sm leading-7 text-white/54">
              Some YouTube topics spike briefly. Others continue to grow.
              VidCluster helps you focus on the ones that keep building.
            </p>
          </div>
        </div>
      </Section>

      <Section spacing="standard">
        <div className="overflow-hidden rounded-[2.25rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.014))] p-8 lg:p-10">
          <div className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
              Product Preview
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
              A simple view of what VidCluster will surface
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/60">
              VidCluster is being built to surface early topic movement, grouped
              video patterns, and clearer topic timing - not just isolated spikes.
            </p>
          </div>

          <div className="mt-10 rounded-[1.95rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.028),rgba(255,255,255,0.016))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.3)] sm:p-5 lg:p-6">
            <div className="grid gap-4 lg:grid-cols-[0.94fr_1.08fr_0.9fr]">
              <div className="rounded-[1.55rem] border border-white/8 bg-black/20 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.2em] text-white/34">
                      Topic signal
                    </div>
                    <div className="mt-2 text-xl font-medium tracking-[-0.03em] text-white/92">
                      AI side hustles
                    </div>
                  </div>
                  <div className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-emerald-300/80">
                    Rising
                  </div>
                </div>

                <div className="mt-5 rounded-[1.2rem] border border-white/6 bg-white/[0.02] p-4">
                  <svg
                    viewBox="0 0 220 96"
                    className="h-24 w-full"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 78H210"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="1"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10 58H210"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="1"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10 38H210"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="1"
                      strokeLinecap="round"
                    />
                    <path
                      d="M14 74C36 74 44 70 59 66C76 61 83 60 98 55C112 50 124 46 138 39C154 31 163 28 178 22C188 18 196 15 206 12"
                      stroke="rgba(134,198,166,0.88)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="206" cy="12" r="4" fill="rgba(134,198,166,0.96)" />
                  </svg>

                  <div className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-white/30">
                    <span>Week 1</span>
                    <span>Week 3</span>
                    <span>Week 6</span>
                  </div>
                </div>

                <div className="mt-5 grid gap-2">
                  {[
                    ["Status", "Building"],
                    ["Weeks tracked", "6"],
                    ["Direction", "Rising"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-[1rem] border border-white/7 bg-white/[0.022] px-3.5 py-3"
                    >
                      <span className="text-xs uppercase tracking-[0.18em] text-white/34">
                        {label}
                      </span>
                      <span className="text-sm text-white/78">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.55rem] border border-white/8 bg-black/20 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.2em] text-white/34">
                      Topic cluster view
                    </div>
                    <div className="mt-2 text-sm text-white/58">
                      Related videos forming one topic
                    </div>
                  </div>
                  <div className="h-2.5 w-2.5 rounded-full bg-white/18" />
                </div>

                <div className="mt-6 rounded-[1.3rem] border border-white/6 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.06),transparent_40%)] p-4 sm:p-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      "Beginner AI income ideas",
                      "Freelance AI workflow videos",
                      "Faceless automation channels",
                      "AI tools for solo creators",
                    ].map((item, index) => (
                      <div
                        key={item}
                        className={`rounded-[1rem] border border-white/8 px-4 py-4 ${
                          index === 1 || index === 2 ? "bg-white/[0.04]" : "bg-white/[0.025]"
                        }`}
                      >
                        <div className="h-1.5 w-10 rounded-full bg-white/12" />
                        <div className="mt-4 text-sm leading-6 text-white/72">{item}</div>
                        <div className="mt-4 h-1.5 w-16 rounded-full bg-white/10" />
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-[1rem] border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-emerald-300/80">
                      One shared topic
                    </div>
                    <div className="mt-1 text-sm text-white/68">
                      Multiple related videos grouped into a single emerging theme.
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.55rem] border border-white/8 bg-black/20 p-5">
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/34">
                  Ranked topics
                </div>
                <div className="mt-2 text-sm text-white/58">
                  Early signals worth watching
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    ["01", "AI side hustles", "Building"],
                    ["02", "Short-form editing systems", "Early"],
                    ["03", "Faceless channel workflows", "Steady"],
                    ["04", "Creator research routines", "Early"],
                  ].map(([rank, topic, tag]) => (
                    <div
                      key={topic}
                      className="flex items-center justify-between gap-4 rounded-[1rem] border border-white/7 bg-white/[0.022] px-4 py-3.5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-xs uppercase tracking-[0.18em] text-white/30">
                          {rank}
                        </div>
                        <div className="text-sm text-white/78">{topic}</div>
                      </div>
                      <div
                        className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${
                          tag === "Building"
                            ? "border border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300/80"
                            : tag === "Early"
                              ? "border border-amber-300/20 bg-amber-300/[0.06] text-amber-200/80"
                              : "border border-white/10 bg-white/[0.03] text-white/70"
                        }`}
                      >
                        {tag}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section spacing="standard">
        <div className="overflow-hidden rounded-[2.25rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.024),rgba(255,255,255,0.014))] p-8 lg:p-10">
          <div className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
              Topic view
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Why VidCluster looks at topics, not single videos
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">
              A single video can spike for random reasons. But when multiple
              related videos start moving together, it signals a topic that may
              be worth acting on.
            </p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[0.95fr_auto_1.05fr] lg:items-center">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Upload A",
                  subtitle: "One video",
                  tone: "bg-white/[0.03]",
                  bar: "w-[56%]",
                },
                {
                  title: "Upload B",
                  subtitle: "Another video",
                  tone: "bg-white/[0.02]",
                  bar: "w-[38%]",
                },
                {
                  title: "Upload C",
                  subtitle: "Different angle",
                  tone: "bg-white/[0.025]",
                  bar: "w-[62%]",
                },
                {
                  title: "Upload D",
                  subtitle: "Separate upload",
                  tone: "bg-white/[0.018]",
                  bar: "w-[44%]",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className={`rounded-[1.4rem] border border-white/8 ${card.tone} p-4`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-white/88">
                      {card.title}
                    </div>
                    <div className="h-2 w-2 rounded-full bg-white/28" />
                  </div>
                  <div className="mt-2 text-xs uppercase tracking-[0.18em] text-white/34">
                    {card.subtitle}
                  </div>
                  <div className="mt-5 space-y-2">
                    <div className="h-2 rounded-full bg-white/6" />
                    <div className={`h-2 rounded-full bg-white/14 ${card.bar}`} />
                    <div className="h-2 w-[48%] rounded-full bg-white/8" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                <svg
                  viewBox="0 0 80 80"
                  className="h-8 w-8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16 40H58"
                    stroke="rgba(255,255,255,0.48)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M44 26L58 40L44 54"
                    stroke="rgba(255,255,255,0.72)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-emerald-400/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(80,200,140,0.04))] p-5 shadow-[0_20px_70px_rgba(80,200,140,0.04)]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-300/68">
                    Topic cluster
                  </div>
                  <div className="mt-2 text-xl font-medium tracking-[-0.03em] text-white/92">
                    One bigger topic
                  </div>
                </div>
                <div className="rounded-full border border-emerald-300/12 bg-emerald-300/[0.06] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-emerald-200/58">
                  Moving together
                </div>
              </div>

              <div className="mt-6 rounded-[1.35rem] border border-white/8 bg-black/20 p-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
                  {[
                    "Home studio upgrades",
                    "Camera setup mistakes",
                    "Lighting for talking head videos",
                    "Creator desk essentials",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-[1rem] border border-white/8 bg-white/[0.025] px-3 py-3 text-sm leading-6 text-white/72"
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between rounded-[1rem] border border-emerald-300/10 bg-emerald-300/[0.04] px-4 py-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-emerald-200/62">
                      Shared topic
                    </div>
                    <div className="mt-1 text-sm text-white/84">
                      Creator setup content
                    </div>
                  </div>

                  <svg
                    viewBox="0 0 96 40"
                    className="h-10 w-24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 30C18 30 24 28 34 22C45 16 54 18 64 12C73 7 82 8 92 4"
                      stroke="rgba(129,211,168,0.82)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="92" cy="4" r="2.5" fill="rgba(129,211,168,0.92)" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-8 text-sm leading-7 text-white/48">
            VidCluster helps you see the bigger topic behind multiple videos.
          </p>
        </div>
      </Section>

      <Section spacing="standard">
        <div className="overflow-hidden rounded-[2.25rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.026),rgba(255,255,255,0.014))] p-8 lg:p-10">
          <div className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
              Shift in thinking
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Most tools show what already happened. VidCluster shows what's building next.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">
              The difference is not just what you look at. It is how early you can
              see the topic starting to move.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[0.96fr_1.04fr]">
            <div className="rounded-[1.9rem] border border-white/8 bg-white/[0.018] p-6 lg:p-7">
              <div className="text-[11px] uppercase tracking-[0.24em] text-white/34">
                What most tools do
              </div>

              <div className="mt-6 space-y-4">
                {[
                  "Look at individual videos",
                  "React to sudden spikes",
                  "Show what is already obvious",
                  "Follow surface trends",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.25rem] border border-white/8 bg-black/20 px-4 py-4 text-base leading-7 text-white/58"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.9rem] border border-emerald-400/18 bg-[linear-gradient(180deg,rgba(80,200,140,0.06),rgba(255,255,255,0.018))] p-6 shadow-[0_20px_70px_rgba(80,200,140,0.05)] lg:p-7">
              <div className="text-[11px] uppercase tracking-[0.24em] text-emerald-300/72">
                What VidCluster shows
              </div>

              <div className="mt-6 space-y-4">
                {[
                  "Look at whole topics",
                  "Follow growth over time",
                  "See what is starting to build",
                  "Track what keeps growing",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.25rem] border border-white/8 bg-black/20 px-4 py-4 text-base leading-7 text-white/88"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section id="how-it-works" spacing="standard">
        <div className="max-w-3xl">
          <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
            How it works
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
            Three simple steps behind VidCluster.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">
            A creator-first way to understand topic movement without drowning in noise.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.024),rgba(255,255,255,0.014))] p-6 lg:p-7"
            >
              <div className="text-[11px] uppercase tracking-[0.24em] text-white/34">
                {step.number}
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
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
              Built on real data
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Tested on real YouTube topic behaviour - not guesswork.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">
              VidCluster tracks how topics actually grow over time, then checks
              whether the early signal held up later.
            </p>
          </div>

          <a
            href="/research"
            className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-white/90 transition hover:border-white/20 hover:bg-white/[0.05]"
          >
            View Research
          </a>
        </div>
      </Section>

      <Section spacing="standard">
        <div className="rounded-[2.25rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.024),rgba(255,255,255,0.014))] p-8 lg:p-12">
          <div className="max-w-4xl">
            <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
              Philosophy
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Find better topics earlier. Ignore short-lived spikes.
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/60">
              The goal is simple: help creators spot topics with real momentum and
              avoid wasting time on short-lived spikes.
            </p>
          </div>
        </div>
      </Section>

      <Section id="cta" bleed spacing="none" className="border-t border-white/8 bg-white/[0.018]">
        <Container className="flex flex-col items-start justify-between gap-8 py-16 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
              Next step
            </div>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.05em] sm:text-6xl sm:leading-[0.98]">
              Be early to the topics that matter.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">
              See the research, understand the approach, and join early if it fits
              how you choose what to make next.
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
        </Container>
      </Section>
    </PageShell>
  );
}
