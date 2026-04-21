import { Helmet } from "react-helmet-async";

type PageSeoProps = {
  title: string;
  description: string;
  url: string;
};

export default function PageSeo({ title, description, url }: PageSeoProps) {
  return (
    <Helmet>
      <title>{title}</title>

      <meta name="description" content={description} />

      <link rel="canonical" href={`https://vidcluster.com${url}`} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`https://vidcluster.com${url}`} />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}