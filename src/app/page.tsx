import { WholePageScroll } from "@/components/home/WholePageScroll";
import { createClient } from "@/lib/supabase/server";
import { Profile, Subject } from "@/types/database";
import { getTranslations } from "next-intl/server";
import { SoftwareApplicationJsonLd, FAQJsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";

// Homepage FAQ for GEO optimization
const homepageFaqs = [
  {
    question: "What is StudyPilot?",
    answer:
      "StudyPilot is an exam practice platform with 10,000+ curated questions, spaced repetition flashcards, and smart mistake tracking for university students.",
  },
  {
    question: "How does StudyPilot help with exam preparation?",
    answer:
      "StudyPilot uses organized question banks from past exams and scientifically-proven spaced repetition to help students master course material efficiently.",
  },
  {
    question: "Which universities and courses are supported?",
    answer:
      "StudyPilot currently supports courses from the University of Queensland including CSSE1001, CSSE7030, COMP3506, INFS3202, INFS7202 and more.",
  },
];

export default async function Home() {
  const supabase = await createClient();

  // Check for session
  let user = null;
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch (error) {
    // Suppress auth errors (e.g. invalid refresh token) and treat as logged out
    console.error("Auth error:", error);
  }

  let userData = null;
  let isAdmin = false;

  const subjectsPromise = supabase
    .from("subjects")
    .select("id, name, slug, icon, description, question_count, is_new, is_hot")
    .order("name");

  const totalQuestionsPromise = supabase
    .from("questions")
    .select("*", { count: "exact", head: true });

  const totalBanksPromise = supabase
    .from("question_banks")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true);

  const translationsPromise = Promise.all([
    getTranslations("home"),
    getTranslations("results"),
    getTranslations("subjects"),
  ]);

  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, is_vip")
      .eq("id", user.id)
      .single();

    const profile = profileData as Profile | null;

    userData = {
      username:
        profile?.username ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "User",
      avatar_url:
        profile?.avatar_url ||
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        undefined,
      is_vip: profile?.is_vip || false,
    };

    isAdmin =
      !!process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL;
  }

  const [subjectsResult, totalQuestionsResult, totalBanksResult, translations] =
    await Promise.all([
      subjectsPromise,
      totalQuestionsPromise,
      totalBanksPromise,
      translationsPromise,
    ]);

  const subjects = (subjectsResult.data || []) as Subject[];
  const t = translations[0];
  const t2 = translations[1];
  const t3 = translations[2];

  const totalQuestions = totalQuestionsResult.count;
  const totalBanks = totalBanksResult.count;

  const content = {
    hero: {
      title: t("title"),
      subtitle: t("subtitle"),
      completed: t("hero.completed"),
      tagList: t("hero.tagList"),
      tagFunction: t("hero.tagFunction"),
    },
    features: {
      title: t("features.title"),
      subtitle: t("features.subtitle"),
      coreFeatures: t("features.coreFeatures"),
      bank: {
        title: t("features.bank.title"),
        description: t("features.bank.description"),
      },
      mistakes: {
        title: t("features.mistakes.title"),
        description: t("features.mistakes.description"),
      },
      flow: {
        title: t("features.flow.title"),
        description: t("features.flow.description"),
      },
      flashcards: {
        title: t("features.flashcards.title"),
        description: t("features.flashcards.description"),
      },
    },
    stats: {
      users: t("stats.users"),
      subjects: t("stats.subjects"),
      questions: t("stats.questions"),
    },
    browse: {
      title: t("browseSubjects.title"),
      subtitle: t("browseSubjects.subtitle"),
      viewAll: t("browseSubjects.viewAll"),
    },
    results: {
      accuracy: t2("accuracy"),
    },
    analytics: {
      title: "Smart Analytics",
      subtitle: t("features.mistakes.description"), // Reusing existing text or hardcoding
      features: {
        radar: "Knowledge Radar",
        history: "History",
      },
    },
    common: {
      questions: t3("questions"),
    },
  };

  return (
    <>
      {/* Structured Data for GEO/SEO */}
      <SoftwareApplicationJsonLd />
      <FAQJsonLd faqs={homepageFaqs} />

      {/* 
        Server-Rendered SEO Content Layer
        This content is immediately available to crawlers before JS hydration.
        It's visually hidden but semantically rich for search engines and AI.
      */}
      <article
        className="sr-only"
        aria-label="StudyPilot - Exam Practice Platform"
        itemScope
        itemType="https://schema.org/WebPage"
      >
        <header>
          <h1 itemProp="name">StudyPilot - Exam Practice Platform</h1>
          <p itemProp="description">
            Master your university exams with StudyPilot's question banks,
            spaced repetition flashcards, and smart mistake tracking. Practice
            smarter for midterms and finals with{" "}
            {totalQuestions?.toLocaleString() || "10,000"}+ curated questions
            across {subjects.length} subjects.
          </p>
        </header>

        <section aria-label="Key Features">
          <h2>Why Students Choose StudyPilot</h2>
          <ul>
            <li>
              <strong>Question Banks:</strong> {totalBanks || "50"}+ curated
              question banks from past exams, organized by topic with detailed
              explanations.
            </li>
            <li>
              <strong>Detailed Explanations:</strong> Learn from clear,
              structured explanations to understand why an answer is correct.
            </li>
            <li>
              <strong>Spaced Repetition:</strong> Scientifically-proven
              flashcard system that schedules reviews at optimal intervals for
              long-term retention.
            </li>
            <li>
              <strong>Immersive Mode:</strong> Distraction-free practice
              sessions with real-time feedback and progress tracking.
            </li>
          </ul>
        </section>

        <section aria-label="Available Subjects">
          <h2>Practice Materials for {subjects.length} Subjects</h2>
          <ul>
            {subjects.slice(0, 10).map((subject) => (
              <li key={subject.id}>
                <Link href={`/library/${subject.slug}`}>
                  {subject.icon} {subject.name}
                  {subject.description && ` - ${subject.description}`}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Frequently Asked Questions">
          <h2>Frequently Asked Questions</h2>
          {homepageFaqs.map((faq, i) => (
            <div key={i}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </section>

        <footer>
          <p>
            Built by students at the University of Queensland. Trusted by
            thousands of students for CSSE1001, CSSE7030, COMP3506, INFS3202,
            INFS7202 and more.
          </p>
          <nav aria-label="Quick Links">
            <Link href="/library">Browse Library</Link> |
            <Link href="/library">Question Banks</Link> |
            <Link href="/faq">FAQ</Link>
          </nav>
        </footer>
      </article>

      {/* Noscript fallback for users without JavaScript */}
      <noscript>
        <div className="min-h-screen bg-white p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">StudyPilot</h1>
            <p className="text-xl mb-8">
              Exam Practice Platform for University Students
            </p>
            <p className="mb-4">
              Master your exams with{" "}
              {totalQuestions?.toLocaleString() || "10,000"}+ curated questions
              and spaced repetition flashcards.
            </p>
            <a href="/login" className="text-blue-600 underline">
              Get Started →
            </a>
            <h2 className="text-2xl font-bold mt-8 mb-4">Available Subjects</h2>
            <ul className="space-y-2">
              {subjects.map((subject) => (
                <li key={subject.id}>
                  <a
                    href={`/library/${subject.slug}`}
                    className="text-blue-600 hover:underline"
                  >
                    {subject.icon} {subject.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </noscript>

      {/* Interactive Client Component */}
      <WholePageScroll
        user={userData}
        isAdmin={isAdmin}
        subjects={subjects}
        content={content}
      />
    </>
  );
}
