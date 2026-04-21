import { Link } from "react-router-dom";
import PageShell from "../../components/layout/PageShell";
import PageSeo from "../../components/seo/PageSeo";

<PageSeo
  title="VidCluster Insights | YouTube Topic Discovery, Trend Timing, and Strategy"
  description="Explore research and strategy on finding YouTube topics early and understanding topic-level growth."
  url="/insights"
/>


const FEATURED_SLUG = "/insights/find-topics";

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
  {
  title: "Why YouTube Trending Pages Are Useless for Finding New Topics",
  description:
    "Most creators rely on YouTube trending pages, but by the time something trends the opportunity is already gone. Here’s why.",
  slug: "/insights/youtube-trending-is-useless",
  },
  {
  title: "Topic vs Keyword: The Biggest Mistake in YouTube Research",
  description:
    "Many creators approach YouTube like a keyword problem. This article explains why topic-level thinking is often more useful.",
  slug: "/insights/topic-vs-keyword",
  },
];

const featuredArticle = articles.find(
  (a) => a.slug === FEATURED_SLUG
);

const otherArticles = articles.filter(
  (a) => a.slug !== FEATURED_SLUG
);

export default function InsightsPage() {
  return (
    <PageShell contained>
      <section className="mb-16">
  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
    <p className="text-xs uppercase tracking-wide text-white/50">
      Featured Insight
    </p>

    <h2 className="mt-3 text-2xl font-semibold text-white">
      How to Find YouTube Topics Before They Become Saturated
    </h2>

    <p className="mt-3 max-w-xl text-white/70">
      Most creators discover trends too late. Learn how to identify early-stage
      topic momentum before competition arrives.
    </p>

    <a
      href="/insights/find-topics"
      className="mt-6 inline-block text-sm font-medium text-white underline underline-offset-4"
    >
      Read article →
    </a>
  </div>
</section>
      <section className="mt-16">
  <div className="mb-10">
    <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium tracking-wide text-white/60">
      Insights
    </div>
    

    <h1 className="text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
      Research & Thinking Behind YouTube Topic Discovery
    </h1>

    <p className="mt-4 max-w-2xl text-white/70">
      We focus on how topics grow - not just which videos go viral. These
      articles explore early signals, trend timing, and a more structured
      approach to finding content opportunities.
    </p>
  </div>

  <div className="grid gap-6 md:grid-cols-2">
    {otherArticles.map((post) => (
      <Link
        key={post.slug}
        to={post.slug}
        className="group rounded-xl border border-white/10 bg-white/[0.02] p-6 transition hover:bg-white/[0.05]"
      >
        <h3 className="text-lg font-semibold text-white group-hover:underline">
          {post.title}
        </h3>

        <p className="mt-2 text-sm text-white/60">
          {post.description}
        </p>

        <span className="mt-4 inline-block text-sm text-white/50 group-hover:text-white">
          Read →
        </span>
      </Link>
    ))}
  </div>
</section>
    </PageShell>
  );
}
