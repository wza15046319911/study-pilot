import { Header } from "@/components/layout/Header";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { FAQJsonLd } from "@/components/seo/JsonLd";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "FAQ - Frequently Asked Questions | StudyPilot",
  description:
    "Find answers to common questions about StudyPilot - the AI-powered exam practice platform.",
};

const faqs = [
  {
    question: "What is StudyPilot?",
    answer:
      "StudyPilot is an AI-powered exam practice platform designed for university students. It offers curated question banks from past exams, AI-powered tutoring, spaced repetition flashcards, and smart mistake tracking to help you study more effectively.",
  },
  {
    question: "How does the Question Bank work?",
    answer:
      "Our question banks contain thousands of practice questions organized by subject and topic. Each question includes detailed explanations, and our AI tutor can provide personalized help when you get stuck.",
  },
  {
    question: "What is Spaced Repetition?",
    answer:
      "Spaced repetition is a scientifically-proven learning technique that schedules reviews at optimal intervals to maximize long-term retention. StudyPilot's flashcard system automatically determines when you should review each card.",
  },
  {
    question: "Is StudyPilot free to use?",
    answer:
      "Yes! StudyPilot offers a free tier that includes access to selected question banks and basic features. Premium features like unlimited question banks and AI tutoring are available with a subscription.",
  },
  {
    question: "Which courses are supported?",
    answer:
      "StudyPilot currently supports courses from the University of Queensland, including CSSE1001, CSSE7030, COMP3506, INFS3202, and more. We're constantly adding new courses.",
  },
  {
    question: "How does the AI Tutor work?",
    answer:
      "Our AI tutor analyzes your answers and provides personalized explanations when you make mistakes. It can break down complex concepts and suggest related topics to review.",
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

export default function FAQPage() {
  return (
    <>
      <FAQJsonLd faqs={faqs} />

      <div className="relative min-h-screen flex flex-col bg-white dark:bg-slate-950">
        <Header user={null} />

        <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="grid lg:grid-cols-[1fr_240px] gap-16">
            {/* Main Content */}
            <article className="max-w-2xl">
              {/* Header */}
              <header className="mb-12">
                <p className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-4">
                  Support
                </p>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                  Frequently Asked Questions
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
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

              {/* FAQ Accordion */}
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <details
                    key={index}
                    className="group bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                  >
                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none select-none">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white pr-4">
                        {faq.question}
                      </h2>
                      <ChevronDown className="size-5 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0" />
                    </summary>
                    <div className="px-6 pb-6 pt-0">
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            </article>

            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-8">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                    Quick Links
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                    <li>
                      <Link
                        href="/library"
                        className="hover:text-blue-600 transition-colors"
                      >
                        Browse Library
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/pricing"
                        className="hover:text-blue-600 transition-colors"
                      >
                        Pricing Plans
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/contact"
                        className="hover:text-blue-600 transition-colors"
                      >
                        Contact Support
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </main>

        <BlogFooter />
      </div>
    </>
  );
}
