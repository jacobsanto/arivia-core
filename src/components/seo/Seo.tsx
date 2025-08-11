import React from "react";
import { Helmet } from "react-helmet-async";

export interface SeoProps {
  title: string;
  description?: string;
  canonical?: string; // absolute or path
  noindex?: boolean;
  image?: string;
}

function buildCanonical(canonical?: string): string | undefined {
  if (!canonical) return undefined;
  try {
    if (canonical.startsWith("http")) return canonical;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}${canonical}`;
  } catch {
    return canonical;
  }
}

export const Seo: React.FC<SeoProps> = ({ title, description, canonical, noindex, image }) => {
  const href = buildCanonical(canonical);
  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {href && <link rel="canonical" href={href} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph basics */}
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      {href && <meta property="og:url" content={href} />} 
      {image && <meta property="og:image" content={image} />}
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
};

export default Seo;
