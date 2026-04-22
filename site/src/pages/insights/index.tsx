import { Link } from "react-router-dom";
import PageShell from "../../components/layout/PageShell";
import PageSeo from "../../components/seo/PageSeo";
import { insights } from "../../content/insights";

const FEATURED_SLUG = "/insights/find-topics";

const featuredArticle = insights.find((article) => article.slug === FEATURED_SLUG);
const otherArticles = insights.filter((article) => article.slug !== FEATURED_SLUG);

export default function InsightsPage() {
  return (
    <>
      <PageSeo
        title="VidCluster Insights | YouTube Topic Discovery, Trend Timing, and Strategy"
        description="Explore research and strategy on finding YouTube topics early and understanding topic-level growth."
        url="/insights"
      />

      <PageShell contained>
        {featuredArticle && (
          <section className="mb-16">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <p className="text-xs uppercase tracking-wide text-white/50">
                Featured Insight
              </p>

              <h2 className="mt-3 text-2xl font-semibold text-white">
                {featuredArticle.title}
              </h2>

              <p className="mt-3 max-w-xl text-white/70">
                {featuredArticle.description}
              </p>

              <Link
                to={featuredArticle.slug}
                className="mt-6 inline-block text-sm font-medium text-white underline underline-offset-4"
              >
                Read article →
              </Link>
            </div>
          </section>
        )}

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
    </>
  );
}
