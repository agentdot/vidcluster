const relatedMap: Record<string, { title: string; href: string }[]> = {
  "/insights/find-topics": [
    {
      title: "Why Most YouTube Creators Discover Trends Too Late",
      href: "/insights/why-trends-are-late",
    },
    {
      title: "vidIQ Alternative: A Different Way to Find YouTube Opportunities",
      href: "/vidiq-alternative",
    },
    {
      title: "TubeBuddy Alternative: A Different Way to Find YouTube Opportunities",
      href: "/tubebuddy-alternative",
    },
  ],

  "/insights/why-trends-are-late": [
    {
      title: "How to Find YouTube Topics Before They Become Saturated",
      href: "/insights/find-topics",
    },
    {
      title: "vidIQ Alternative: A Different Way to Find YouTube Opportunities",
      href: "/vidiq-alternative",
    },
    {
      title: "TubeBuddy Alternative: A Different Way to Find YouTube Opportunities",
      href: "/tubebuddy-alternative",
    },
  ],
};

export default function RelatedArticles({ slug }: { slug: string }) {
  const articles = relatedMap[slug] || [];

  if (!articles.length) return null;

  return (
    <div className="mt-16 border-t border-white/10 pt-10">
      <h3 className="text-lg font-semibold text-white">Related reading</h3>

      <div className="mt-6 space-y-4">
        {articles.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="block text-white/70 hover:text-white transition"
          >
            → {item.title}
          </a>
        ))}
      </div>
    </div>
  );
}