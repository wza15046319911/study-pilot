"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  CheckCircle2,
  XCircle,
  Zap,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  CountdownTimer,
  isPromotionActive,
} from "@/components/ui/CountdownTimer";
import { CheckoutButton } from "@/components/payment/CheckoutButton";
import { FAQSection } from "@/components/common/FAQSection";


// Beta Promotion Config
const BETA_END_DATE = new Date("2026-02-06T23:59:59+11:00"); // Feb 6, 2026 AEST
const BETA_PRICE = "A$9.9";
const NORMAL_PRICE = "A$49.9";

export function PricingContent() {
  const [isPromoActive, setIsPromoActive] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsPromoActive(isPromotionActive(BETA_END_DATE));
  }, []);

  const tiers = [
    {
      name: "Free",
      price: "A$0",
      description: "Perfect for getting started",
      features: [
        "Access to public question banks",
        "Standard practice mode",
        "Basic progress tracking",
        "10 questions per session",
      ],
      notIncluded: [
        "Premium question banks",
        "Mock exams",
        "AI-powered explanations",
        "Mistake analysis",
      ],
      cta: "Get Started",
      variant: "default",
      popular: false,
    },
    {
      name: "Beta Access",
      price: BETA_PRICE,
      originalPrice: NORMAL_PRICE,
      period: "one-time",
      popular: true,
      description: "Limited time beta offer. Full lifetime access.",
      features: [
        "Unlock ALL subjects forever",
        "Unlimited mock exams",
        "AI-powered explanations",
        "Immersive study mode",
        "Advanced mistake analysis",
        "PDF exam export",
        "Early access to new features",
      ],
      cta: "Join Beta",
      variant: "primary",
    },
    {
      name: "Standard",
      price: NORMAL_PRICE,
      period: "one-time",
      popular: false,
      description: "Standard lifetime price after beta ends.",
      features: [
        "Unlock ALL subjects forever",
        "Unlimited mock exams",
        "AI-powered explanations",
        "Immersive study mode",
        "Advanced mistake analysis",
        "PDF exam export",
        "All future updates free",
      ],
      cta: "Standard Access",
      variant: "default",
    },
  ];

  return (
    <main className="flex-grow w-full pt-20 pb-20 px-4">
      <section className="max-w-7xl mx-auto text-center mb-16">
        {/* Beta Badge */}
        {isPromoActive && mounted ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 mb-6 animate-pulse">
            <Sparkles className="size-4 text-amber-500" />
            <span className="text-sm font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
              🚀 Internal Beta Special - Limited Time!
            </span>
          </div>
        ) : null}

        <h1 className="text-4xl md:text-6xl font-black mb-6 dark:text-white tracking-tight">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Choose the plan that fits your study needs. No hidden fees.
        </p>

        {/* Countdown Timer */}
        {isPromoActive && mounted ? (
          <div className="mt-8 inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
            <Clock className="size-5 text-blue-600 dark:text-blue-400" />
            <CountdownTimer targetDate={BETA_END_DATE} />
          </div>
        ) : null}
      </section>

      <section className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 px-4 items-start">
        {tiers.map((tier) => (
          <GlassPanel
            key={tier.name}
            variant="card"
            className={`p-8 flex flex-col relative transition-[border-color,box-shadow,transform] duration-300 ${
              tier.popular
                ? "border-blue-500/50 dark:border-blue-500 ring-4 ring-blue-500/10 shadow-2xl scale-105 z-10"
                : "hover:border-gray-300 dark:hover:border-gray-600 opacity-90 hover:opacity-100"
            }`}
          >
            {tier.popular ? (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2">
                <ShieldCheck className="size-4" />
                Best Value
              </div>
            ) : null}
            <div className="mb-8 text-center">
              <h3 className="text-xl font-bold mb-2 dark:text-white">
                {tier.name}
              </h3>
              <div className="flex items-center justify-center gap-2 mb-2">
                {/* Original Price (Strikethrough) */}
                {tier.originalPrice ? (
                  <span className="text-2xl font-medium text-slate-400 line-through">
                    {tier.originalPrice}
                  </span>
                ) : null}
                {/* Current Price */}
                <span
                  className={`text-5xl font-black tracking-tight ${
                    tier.popular
                      ? "text-green-600 dark:text-green-400"
                      : "text-slate-900 dark:text-white"
                  }`}
                >
                  {tier.price}
                </span>
              </div>
              {tier.period ? (
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                    {tier.period}
                  </span>
                ) : null}
              
              {/* Savings Badge */}
              {tier.popular && isPromoActive ? (
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-bold mt-2">
                  <Zap className="size-3" />
                  Save 80%!
                </div>
              ) : null}
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
                {tier.description}
              </p>
            </div>

            <div className="space-y-4 mb-8 flex-1">
              {tier.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 p-0.5 rounded-full ${
                      tier.popular
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    }`}
                  >
                    <CheckCircle2 className="size-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {feature}
                  </span>
                </div>
              ))}
              {tier.notIncluded?.map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-3 opacity-40"
                >
                  <XCircle className="size-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-500">{feature}</span>
                </div>
              ))}
            </div>

            {tier.popular ? (
              <CheckoutButton className="w-full py-4 rounded-xl font-bold transition-[background-color,box-shadow,transform] duration-200 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5">
                {tier.cta}
              </CheckoutButton>
            ) : tier.name === "Standard" ? (
               <button disabled className="w-full py-4 rounded-xl font-bold transition-all duration-200 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700">
                Coming Soon
              </button>
            ) : (
              <Link
                href="/library"
                className="block w-full py-4 rounded-xl font-bold transition-[background-color,border-color,color] duration-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-gray-200 dark:border-slate-700 text-center"
              >
                {tier.cta}
              </Link>
            )}

            {tier.popular ? (
              <p className="text-xs text-center text-gray-400 mt-4">
                One-time payment. 30-day money-back guarantee.
              </p>
            ) : null}
          </GlassPanel>
        ))}
      </section>

      {/* Comparison Table */}
      <section className="max-w-6xl mx-auto px-4 mt-24 mb-16">
        <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">
          Compare Features
        </h2>
        <GlassPanel className="overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
                  <th className="p-6 text-sm font-semibold text-slate-500 dark:text-slate-400 w-1/4">
                    Features
                  </th>
                  <th className="p-6 text-lg font-bold text-slate-900 dark:text-white w-1/4 text-center">
                    Free
                  </th>
                  <th className="p-6 text-lg font-bold text-blue-600 dark:text-blue-400 w-1/4 text-center">
                    Beta Access
                  </th>
                  <th className="p-6 text-lg font-bold text-slate-700 dark:text-slate-300 w-1/4 text-center">
                    Standard
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                <tr>
                  <td className="p-6 font-medium dark:text-gray-200">
                    Question Bank Access
                  </td>
                  <td className="p-6 text-center text-gray-600 dark:text-gray-400">
                    Basic Questions Only
                  </td>
                  <td className="p-6 text-center font-bold text-blue-600 dark:text-blue-400">
                    Unlimited Access
                  </td>
                   <td className="p-6 text-center font-medium text-slate-700 dark:text-slate-300">
                    Unlimited Access
                  </td>
                </tr>
                <tr>
                  <td className="p-6 font-medium dark:text-gray-200">
                    Explanations
                  </td>
                  <td className="p-6 text-center text-gray-600 dark:text-gray-400">
                    Basic
                  </td>
                  <td className="p-6 text-center font-bold text-blue-600 dark:text-blue-400">
                    Detailed &amp; AI-Powered
                  </td>
                  <td className="p-6 text-center font-medium text-slate-700 dark:text-slate-300">
                    Detailed &amp; AI-Powered
                  </td>
                </tr>
                <tr>
                  <td className="p-6 font-medium dark:text-gray-200">
                    Practice Exams
                  </td>
                  <td className="p-6 text-center text-gray-600 dark:text-gray-400">
                    1 per subject
                  </td>
                  <td className="p-6 text-center font-bold text-blue-600 dark:text-blue-400">
                    Unlimited
                  </td>
                  <td className="p-6 text-center font-medium text-slate-700 dark:text-slate-300">
                    Unlimited
                  </td>
                </tr>
                <tr>
                  <td className="p-6 font-medium dark:text-gray-200">
                    Mistake Book History
                  </td>
                  <td className="p-6 text-center text-gray-600 dark:text-gray-400">
                    Last 50 questions
                  </td>
                  <td className="p-6 text-center font-bold text-blue-600 dark:text-blue-400">
                    Unlimited History
                  </td>
                   <td className="p-6 text-center font-medium text-slate-700 dark:text-slate-300">
                    Unlimited History
                  </td>
                </tr>
                <tr>
                  <td className="p-6 font-medium dark:text-gray-200">
                    Flashcards
                  </td>
                  <td className="p-6 text-center text-gray-600 dark:text-gray-400">
                    Limited Sets
                  </td>
                  <td className="p-6 text-center font-bold text-blue-600 dark:text-blue-400">
                    Unlimited
                  </td>
                  <td className="p-6 text-center font-medium text-slate-700 dark:text-slate-300">
                    Unlimited
                  </td>
                </tr>
                <tr className="bg-gray-50/30 dark:bg-white/5">
                  <td className="p-6 font-medium dark:text-gray-200">
                    Immersive Flow Mode
                  </td>
                  <td className="p-6 text-center text-gray-400 text-2xl">
                    <span className="sr-only">Not Included</span>
                    &minus;
                  </td>
                  <td className="p-6 text-center text-blue-600 dark:text-blue-400 text-2xl">
                    <div className="flex justify-center">
                      <CheckCircle2 className="size-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </td>
                   <td className="p-6 text-center text-slate-700 dark:text-slate-300 text-2xl">
                    <div className="flex justify-center">
                      <CheckCircle2 className="size-6 text-slate-700 dark:text-slate-300" />
                    </div>
                  </td>
                </tr>
                <tr className="bg-gray-50/30 dark:bg-white/5">
                  <td className="p-6 font-medium dark:text-gray-200">
                    Performance Analytics
                  </td>
                  <td className="p-6 text-center text-gray-400 text-2xl">
                    <span className="sr-only">Not Included</span>
                    &minus;
                  </td>
                  <td className="p-6 text-center text-blue-600 dark:text-blue-400 text-2xl">
                    <div className="flex justify-center">
                      <CheckCircle2 className="size-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </td>
                   <td className="p-6 text-center text-slate-700 dark:text-slate-300 text-2xl">
                    <div className="flex justify-center">
                      <CheckCircle2 className="size-6 text-slate-700 dark:text-slate-300" />
                    </div>
                  </td>
                </tr>
                <tr className="bg-gray-50/30 dark:bg-white/5">
                  <td className="p-6 font-medium dark:text-gray-200">
                    Future Updates
                  </td>
                  <td className="p-6 text-center text-gray-400 text-2xl">
                    <span className="sr-only">Not Included</span>
                    &minus;
                  </td>
                  <td className="p-6 text-center text-blue-600 dark:text-blue-400 text-2xl">
                    <div className="flex justify-center">
                      <CheckCircle2 className="size-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </td>
                   <td className="p-6 text-center text-slate-700 dark:text-slate-300 text-2xl">
                    <div className="flex justify-center">
                      <CheckCircle2 className="size-6 text-slate-700 dark:text-slate-300" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </GlassPanel>
      </section>


      {/* Pricing FAQ Section */}
      <FAQSection
        items={[
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
              "We accept all major credit cards (Visa, Mastercard, Amex), Apple Pay, and Google Pay through our secure payment processor Stripe.",
          },
          {
            question: "Is there a money-back guarantee?",
            answer:
              "Yes! We offer a full 30-day money-back guarantee. If you're not satisfied with StudyPilot for any reason, just contact us for a full refund.",
          },
          {
            question: "What happens after the early bird promotion ends?",
            answer:
              "Once the early bird promotion ends, correct pricing will revert to the regular price. We recommend locking in the lifetime deal now to save over 60%.",
          },
        ]}
        className="mt-16 bg-white/50 dark:bg-black/20"
      />
    </main>
  );
}

