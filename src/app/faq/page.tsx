import { Header } from "@/components/layout/Header";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { FAQJsonLd } from "@/components/seo/JsonLd";
import { FAQSection } from "@/components/common/FAQSection";
import { getHeaderUser } from "@/lib/auth/getHeaderUser";
import Link from "next/link";

export const metadata = {
  title: "FAQ - Frequently Asked Questions | StudyPilot",
  description:
    "Find answers to common questions about StudyPilot - the exam practice platform.",
};

const faqs = [
  {
    question: "What is StudyPilot?",
    answer:
      "StudyPilot is an exam practice platform designed for university students. It offers curated question banks from past exams, spaced repetition flashcards, and smart mistake tracking to help you study more effectively.",
  },
  {
    question: "How does the Question Bank work?",
    answer:
      "Our question banks contain thousands of practice questions organized by subject and topic. Each question includes detailed explanations to help you learn.",
  },
  {
    question: "What is Spaced Repetition?",
    answer:
      "Spaced repetition is a scientifically-proven learning technique that schedules reviews at optimal intervals to maximize long-term retention. StudyPilot's flashcard system automatically determines when you should review each card.",
  },
  {
    question: "Is StudyPilot free to use?",
    answer:
      "Yes! StudyPilot offers a free tier that includes access to selected question banks and basic features. Premium features like unlimited question banks are available with a subscription.",
  },
  {
    question: "Which courses are supported?",
    answer:
      "StudyPilot currently supports courses from the University of Queensland, including CSSE1001, CSSE7030, COMP3506, INFS3202, and more. We're constantly adding new courses.",
  },
  {
    question: "Can I track my progress?",
    answer:
      "Absolutely! StudyPilot provides detailed analytics including accuracy rates by topic, time spent studying, improvement trends, and a knowledge radar that visualizes your strengths and weaknesses.",
  },
  {
    question: "How do I report an error?",
    answer:
      "If you find an error in any question or answer, you can use the feedback button on the question page to report it. Our team reviews all submissions regularly.",
  },
];

export default async function FAQPage() {
  const headerUser = await getHeaderUser();

  return (
    <>
      <FAQJsonLd faqs={faqs} />

      <div className="relative min-h-screen flex flex-col bg-white dark:bg-slate-950">
        <Header showNav={true} user={headerUser} />

        <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="max-w-3xl mx-auto">
            {/* Main Content */}
            <article>
              {/* Header */}
              <header className="mb-12 text-center">
                <p className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-4">
                  Support
                </p>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                  Frequently Asked Questions
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
                  Everything you need to know about StudyPilot. Can&apos;t find
                  your answer?{" "}
                  <Link
                    href="/contact"
                    className="text-blue-600 hover:underline"
                  >
                    Contact us
                  </Link>
                </p>
              </header>

              <FAQSection showTitle={false} className="py-0" />
            </article>
          </div>
        </main>

        <BlogFooter />
      </div>
    </>
  );
}
