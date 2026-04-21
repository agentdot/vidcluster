import { Link } from "react-router-dom";
import PageShell from "../../components/layout/PageShell";

const articles = [
  {
    title: "How to Find YouTube Topics Before They Become Saturated",
    description:
      "Most creators discover trends too late. Learn how to identify early-stage topics using a topic-level approach instead of chasing viral spikes.",
    slug: "/insights/find-topics",
  },
  {
    title: "Why Most YouTube Creators Discover Trends Too Late",
    description:
      "Most creators rely on signals that appear after a trend has already started. Understand why trend discovery is usually late.",
    slug: "/insights/why-trends-are-late",
  },
];

export default function InsightsPage() {
  return (
    <PageShell contained>
      <header className="mb-16 max-w-2xl">
        <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium tracking-wide text-white/52">
          Insights
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Research & Thinking Behind YouTube Topic Discovery
        </h1>

        <p className="mt-5 text-base leading-7 text-white/60 sm:text-lg">
          We focus on how topics grow - not just which videos go viral. These
          articles explore early signals, trend timing, and a more structured
          approach to finding content opportunities.
        </p>
      </header>

      <section className="grid gap-10 sm:grid-cols-2">
        {articles.map((article) => (
          <Link
            key={article.slug}
            to={article.slug}
            className="group block rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:border-white/20 hover:bg-white/[0.03]"
          >
            <h2 className="text-lg font-semibold leading-tight tracking-tight text-white group-hover:underline sm:text-xl">
              {article.title}
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/60 sm:text-base">
              {article.description}
            </p>

            <div className="mt-5 text-sm font-medium text-white/70 group-hover:text-white">
              Read -&gt;
            </div>
          </Link>
        ))}
      </section>
    </PageShell>
  );
}
