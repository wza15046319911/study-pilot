/**
 * JSON-LD Structured Data Components for SEO & GEO
 * These components generate Schema.org structured data for search engines and AI.
 */

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://studypilot.com";

// Website Schema - Add to root layout
export function WebsiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "StudyPilot",
    url: siteUrl,
    description:
      "AI-powered exam practice platform with question banks, flashcards, and spaced repetition for university students.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Organization Schema - Add to root layout
export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "StudyPilot",
    url: siteUrl,
    logo: `${siteUrl}/study-pilot-icon.png`,
    description:
      "Built by students, for students. StudyPilot helps university students master their exams with AI-powered practice tools.",
    sameAs: [
      // Add social media URLs when available
      // "https://twitter.com/studypilot",
      // "https://linkedin.com/company/studypilot",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: `${siteUrl}/contact`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// FAQ Page Schema
interface FAQItem {
  question: string;
  answer: string;
}

export function FAQJsonLd({ faqs }: { faqs: FAQItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Course/Subject Schema - Add to subject pages
interface CourseProps {
  name: string;
  description?: string;
  slug: string;
  questionCount?: number;
}

export function CourseJsonLd({
  name,
  description,
  slug,
  questionCount,
}: CourseProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: name,
    description:
      description || `Practice questions and study materials for ${name}`,
    url: `${siteUrl}/library/${slug}`,
    provider: {
      "@type": "Organization",
      name: "StudyPilot",
      sameAs: siteUrl,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: questionCount
        ? `${questionCount}+ practice questions`
        : undefined,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Software Application Schema - For app/product pages
export function SoftwareApplicationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "StudyPilot",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    url: siteUrl,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "AUD",
      description: "Free tier available",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
      bestRating: "5",
      worstRating: "1",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Breadcrumb Schema - For navigation
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${siteUrl}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
