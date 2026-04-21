import { Helmet } from "react-helmet-async";

type BlogSeoProps = {
  title: string;
  description: string;
  slug: string;
  ogTitle?: string;
  ogDescription?: string;
};

const SITE_NAME = "VidCluster";
const SITE_URL = "https://vidcluster.com";

export default function BlogSeo({
  title,
  description,
  slug,
  ogTitle,
  ogDescription,
}: BlogSeoProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonicalUrl = `${SITE_URL}${slug}`;
  const finalOgTitle = ogTitle ?? title;
  const finalOgDescription = ogDescription ?? description;

  return (
    <Helmet>
      <title>{fullTitle}</title>

      <meta name="description" content={description} />

      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content="article" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={`${finalOgTitle} | ${SITE_NAME}`} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:url" content={canonicalUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${finalOgTitle} | ${SITE_NAME}`} />
      <meta name="twitter:description" content={finalOgDescription} />
    </Helmet>
  );
}