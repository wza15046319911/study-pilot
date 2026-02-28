import { WholePageScroll } from "@/components/home/WholePageScroll";
import { SoftwareApplicationJsonLd, FAQJsonLd } from "@/components/seo/JsonLd";
import { getHomepageSnapshot } from "@/lib/home/getHomepageSnapshot";
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
  const snapshot = await getHomepageSnapshot();
  const subjects = snapshot.topSubjects;
  const totalQuestions = snapshot.totalQuestions;
  const totalBanks = snapshot.totalBanks;
  const subjectCount = snapshot.subjectCount;

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
            across {subjectCount} subjects.
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
          <h2>Practice Materials for {subjectCount} Subjects</h2>
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
      <WholePageScroll />
    </>
  );
}
