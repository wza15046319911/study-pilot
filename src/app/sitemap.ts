import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://studypilot.com";
  const supabase = await createClient();

  // Fetch all published subjects
  const { data: subjects } = await supabase
    .from("subjects")
    .select("slug, updated_at")
    .order("name");

  // Fetch all published question banks
  const { data: questionBanks } = await supabase
    .from("question_banks")
    .select("slug, updated_at, subjects!inner(slug)")
    .eq("is_published", true);

  // Fetch all published exams
  const { data: exams } = await supabase
    .from("exams")
    .select("slug, updated_at, subjects!inner(slug)")
    .eq("is_published", true);

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/library`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Subject pages
  const subjectPages: MetadataRoute.Sitemap = (subjects || []).map(
    (subject: any) => ({
      url: `${baseUrl}/library/${subject.slug}`,
      lastModified: subject.updated_at
        ? new Date(subject.updated_at)
        : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })
  );

  // Question bank pages (Updated to /library/[subject]/question-banks/[bank])
  const questionBankPages: MetadataRoute.Sitemap = (questionBanks || []).map(
    (bank: any) => ({
      url: `${baseUrl}/library/${bank.subjects.slug}/question-banks/${bank.slug}`,
      lastModified: bank.updated_at ? new Date(bank.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })
  );

  // Exam pages (Updated to /library/[subject]/exams/[exam])
  const examPages: MetadataRoute.Sitemap = (exams || []).map((exam: any) => ({
    url: `${baseUrl}/library/${exam.subjects.slug}/exams/${exam.slug}`,
    lastModified: exam.updated_at ? new Date(exam.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Blog pages (hardcoded static routes)
  const blogPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/forgetting-curve-mistake-review`,
      lastModified: new Date("2026-01-08"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/why-you-shouldnt-trust-ai-for-exam-answers`,
      lastModified: new Date("2026-01-06"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/mastering-spaced-repetition`,
      lastModified: new Date("2026-01-04"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/engineering-mechanics-101`,
      lastModified: new Date("2025-12-28"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/updates-jan-2026`,
      lastModified: new Date("2026-01-02"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  return [
    ...staticPages,
    ...subjectPages,
    ...questionBankPages,
    ...examPages,
    ...blogPages,
  ];
}
