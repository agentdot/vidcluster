import type { ReactNode } from "react";
import PageShell from "../layout/PageShell";
import RelatedArticles from "./RelatedArticles";

type BlogLayoutProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  slug: string;
  children: ReactNode;
};

export default function BlogLayout({
  title,
  description,
  eyebrow = "Insights",
  slug,
  children,
}: BlogLayoutProps) {
  return (
    <PageShell contained containerClassName="max-w-4xl">
      <header className="mb-12 border-b border-white/8 pb-8">
        <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium tracking-wide text-white/52">
          {eyebrow}
        </div>

        <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
          {title}
        </h1>

        {description ? (
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">
            {description}
          </p>
        ) : null}
      </header>

      <article
        className="
          max-w-none space-y-6 text-base leading-8 text-white/72
          [&_h2]:pt-8
          [&_h2]:text-2xl
          [&_h2]:font-semibold
          [&_h2]:text-white
          [&_h3]:pt-6
          [&_h3]:text-xl
          [&_h3]:font-semibold
          [&_h3]:text-white
          [&_ul]:list-disc
          [&_ul]:pl-6
          [&_ul]:space-y-2
          [&_li]:text-white/72
          [&_a]:underline
          [&_a]:underline-offset-4
        "
      >
        {children}
      </article>

      <RelatedArticles slug={slug} />
    </PageShell>
  );
}