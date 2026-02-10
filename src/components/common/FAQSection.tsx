"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  className?: string;
  showTitle?: boolean;
}

export function FAQSection({
  title,
  className = "",
  showTitle = true,
}: FAQSectionProps) {
  const t = useTranslations("faqSection");
  const faqItems = t.raw("items") as FAQItem[];
  const sectionTitle = title || t("title");

  return (
    <section className={`py-12 md:py-20 ${className}`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {showTitle && (
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 dark:text-white mb-10 tracking-tight">
            {sectionTitle}
          </h2>
        )}

        <div className="space-y-4">
          {faqItems.map((faq, index) => (
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
