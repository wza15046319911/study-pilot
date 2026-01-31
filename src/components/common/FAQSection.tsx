"use client";

import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  className?: string;
}

const FAQS: FAQItem[] = [
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
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Absolutely. If you choose a subscription plan (future), you can cancel anytime. For our current Lifetime Access deal, it's a one-time payment with no recurring fees.",
  },
  {
    question: "Do you offer student discounts?",
    answer:
      "Our pricing is already optimized for students. The Lifetime Access plan is priced to be affordable for a student budget, equivalent to the cost of a few coffees.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We currently accept all major credit cards (Visa, Mastercard, Amex) through our secure payment processor Stripe.",
  },
  {
    question: "What happens after the early bird promotion ends?",
    answer:
      "Once the early bird promotion ends, correct pricing will revert to the regular price. We recommend locking in the lifetime deal now to save over 80%.",
  },
];

export function FAQSection({
  title = "Frequently Asked Questions",
  className = "",
}: FAQSectionProps) {
  return (
    <section className={`py-12 md:py-20 ${className}`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 dark:text-white mb-10 tracking-tight">
          {title}
        </h2>

        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <details
              key={index}
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none select-none">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white pr-4 text-left">
                  {faq.question}
                </h3>
                <ChevronDown className="size-5 text-slate-400 group-open:rotate-180 transition-transform duration-300 flex-shrink-0" />
              </summary>
              <div className="px-6 pb-6 pt-0">
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
