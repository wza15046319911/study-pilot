import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { FAQJsonLd } from "@/components/seo/JsonLd";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "FAQ - Frequently Asked Questions",
  description:
    "Find answers to common questions about StudyPilot - the AI-powered exam practice platform. Learn about question banks, flashcards, spaced repetition, and more.",
  keywords: [
    "StudyPilot FAQ",
    "exam practice help",
    "question bank guide",
    "flashcards tutorial",
  ],
};

const faqs = [
  {
    question: "What is StudyPilot?",
    answer:
      "StudyPilot is an AI-powered exam practice platform designed for university students. It offers curated question banks from past exams, AI-powered tutoring, spaced repetition flashcards, and smart mistake tracking to help you study more effectively for midterms and finals.",
  },
  {
    question: "How does the Question Bank work?",
    answer:
      "Our question banks contain thousands of practice questions organized by subject and topic. Each question includes detailed explanations, and our AI tutor can provide personalized help when you get stuck. Questions are sourced from past exams and verified by experienced tutors.",
  },
  {
    question: "What is Spaced Repetition?",
    answer:
      "Spaced repetition is a scientifically-proven learning technique that schedules reviews at optimal intervals to maximize long-term retention. StudyPilot's flashcard system automatically determines when you should review each card based on how well you remember it.",
  },
  {
    question: "Is StudyPilot free to use?",
    answer:
      "Yes! StudyPilot offers a free tier that includes access to selected question banks and basic features. Premium features like unlimited question banks, AI tutoring, and advanced analytics are available with a subscription.",
  },
  {
    question: "Which courses are supported?",
    answer:
      "StudyPilot currently supports courses from the University of Queensland, including CSSE1001, CSSE7030, COMP3506, INFS3202, INFS7202, and more. We're constantly adding new courses based on student demand.",
  },
  {
    question: "How does the AI Tutor work?",
    answer:
      "Our AI tutor analyzes your answers and provides personalized explanations when you make mistakes. It can break down complex concepts, suggest related topics to review, and adapt its teaching style based on your learning patterns.",
  },
  {
    question: "Can I track my progress?",
    answer:
      "Absolutely! StudyPilot provides detailed analytics including accuracy rates by topic, time spent studying, improvement trends, and a knowledge radar that visualizes your strengths and weaknesses across different areas.",
  },
  {
    question: "How do I report a wrong answer or typo?",
    answer:
      "If you find an error in any question or answer, you can use the feedback button on the question page to report it. Our team reviews all submissions and updates the content regularly.",
  },
];

export default function FAQPage() {
  return (
    <>
      <FAQJsonLd faqs={faqs} />

      <div className="relative min-h-screen flex flex-col bg-[#f0f4fc] dark:bg-slate-950 overflow-x-hidden">
        <AmbientBackground />
        <Header user={null} />

        <main className="flex-grow w-full max-w-4xl mx-auto px-4 md:px-8 py-16 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">
              FAQ
            </span>
          </nav>

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Everything you need to know about StudyPilot. Can&apos;t find your
              answer?
              <Link
                href="/contact"
                className="text-primary hover:underline ml-1"
              >
                Contact us
              </Link>
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none select-none">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white pr-4">
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

          {/* CTA Section */}
          <div className="mt-16 text-center p-8 bg-gradient-to-br from-primary/5 to-blue-500/5 rounded-3xl border border-primary/10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Still have questions?
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Our team is here to help you succeed in your studies.
            </p>
            <Link
              href="/contact"
              className="inline-flex h-12 px-8 items-center justify-center rounded-full bg-primary text-white font-semibold hover:bg-blue-600 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
