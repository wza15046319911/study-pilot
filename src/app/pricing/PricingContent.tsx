"use client";

import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { CheckCircle2, XCircle, Zap, ShieldCheck } from "lucide-react";
import { isPromotionActive } from "@/components/ui/CountdownTimer";
import { CheckoutButton } from "@/components/payment/CheckoutButton";
import { FAQSection } from "@/components/common/FAQSection";
import { Footer } from "@/components/layout/Footer";
import { useTranslations } from "next-intl";

// Beta Promotion Config
const BETA_END_DATE = new Date("2026-02-06T23:59:59+11:00"); // Feb 6, 2026 AEST
const BETA_PRICE = "$19.9";
const NORMAL_PRICE = "$49.9";

export function PricingContent() {
  const t = useTranslations("pricing");
  const isPromoActive = isPromotionActive(BETA_END_DATE);

  const tiers = [
    {
      id: "free",
      name: t("tiers.free.name"),
      price: "$0",
      description: t("tiers.free.description"),
      features: [
        t("tiers.free.features.publicQuestionBanks"),
        t("tiers.free.features.publicMockExams"),
        t("tiers.free.features.standardPractice"),
        t("tiers.free.features.progressTracking"),
        t("tiers.free.features.mistakeTracking"),
        t("tiers.free.features.weeklyPractice"),
      ],
      notIncluded: [
        t("tiers.free.notIncluded.premiumQuestionBanks"),
        t("tiers.free.notIncluded.premiumMockExams"),
        t("tiers.free.notIncluded.homework"),
        t("tiers.free.notIncluded.pdfExport"),
      ],
      cta: t("tiers.free.cta"),
      variant: "default",
      popular: false,
    },
    {
      id: "beta",
      name: t("tiers.beta.name"),
      price: BETA_PRICE,
      originalPrice: NORMAL_PRICE,
      period: t("tiers.beta.period"),
      popular: true,
      description: t("tiers.beta.description"),
      features: [
        t("tiers.beta.features.unlockAllSubjects"),
        t("tiers.beta.features.unlimitedMockExams"),
        t("tiers.beta.features.immersiveMode"),
        t("tiers.beta.features.flashcardMode"),
        t("tiers.beta.features.homework"),
        t("tiers.beta.features.mistakeAnalysis"),
        t("tiers.beta.features.pdfExport"),
        t("tiers.beta.features.earlyAccess"),
      ],
      cta: t("tiers.beta.cta"),
      variant: "primary",
    },
  ];

  return (
    <>
      <main className="flex-grow w-full pt-20 pb-20 px-4">
        <section className="max-w-7xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black mb-6 dark:text-white tracking-tight">
            {t("hero.title")}
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            {t("hero.subtitle")}
          </p>
        </section>

        <section className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 px-4 items-start">
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
                  {t("badges.bestValue")}
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
                        ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 dark:from-blue-300 dark:via-cyan-300 dark:to-blue-400 will-change-transform motion-safe:animate-price-pulse"
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
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-bold mt-2 ring-1 ring-amber-300/60 dark:ring-amber-500/40">
                    <Zap className="size-3" />
                    {t("badges.save60")}
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
              ) : tier.id === "standard" ? (
                <button
                  disabled
                  className="w-full py-4 rounded-xl font-bold transition-all duration-200 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700"
                >
                  {t("common.comingSoon")}
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
                  {t("badges.guarantee")}
                </p>
              ) : null}
            </GlassPanel>
          ))}
        </section>

        {/* Comparison Table */}
        <section className="max-w-4xl mx-auto px-4 mt-24 mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">
            {t("comparison.title")}
          </h2>
          <GlassPanel className="overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
                    <th className="p-6 text-sm font-semibold text-slate-500 dark:text-slate-400 w-1/3">
                      {t("comparison.headers.features")}
                    </th>
                    <th className="p-6 text-lg font-bold text-slate-900 dark:text-white w-1/3 text-center">
                      {t("tiers.free.name")}
                    </th>
                    <th className="p-6 text-lg font-bold text-blue-600 dark:text-blue-400 w-1/3 text-center">
                      {t("tiers.beta.name")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  <tr>
                    <td className="p-6 font-medium dark:text-gray-200">
                      {t("comparison.rows.questionBankAccess.label")}
                    </td>
                    <td className="p-6 text-center text-gray-600 dark:text-gray-400">
                      {t("comparison.rows.questionBankAccess.free")}
                    </td>
                    <td className="p-6 text-center font-bold text-blue-600 dark:text-blue-400">
                      {t("comparison.rows.questionBankAccess.beta")}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-6 font-medium dark:text-gray-200">
                      {t("comparison.rows.homework.label")}
                    </td>
                    <td className="p-6 text-center text-gray-600 dark:text-gray-400">
                      <span className="sr-only">{t("comparison.notIncludedSrOnly")}</span>
                      &minus;
                    </td>
                    <td className="p-6 text-center font-bold text-blue-600 dark:text-blue-400">
                      {t("comparison.rows.homework.beta")}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-6 font-medium dark:text-gray-200">
                      {t("comparison.rows.practiceModes.label")}
                    </td>
                    <td className="p-6 text-center text-gray-600 dark:text-gray-400">
                      {t("comparison.rows.practiceModes.free")}
                    </td>
                    <td className="p-6 text-center font-bold text-blue-600 dark:text-blue-400">
                      {t("comparison.rows.practiceModes.beta")}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-6 font-medium dark:text-gray-200">
                      {t("comparison.rows.mockExams.label")}
                    </td>
                    <td className="p-6 text-center text-gray-600 dark:text-gray-400">
                      {t("comparison.rows.mockExams.free")}
                    </td>
                    <td className="p-6 text-center font-bold text-blue-600 dark:text-blue-400">
                      {t("comparison.rows.mockExams.beta")}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-6 font-medium dark:text-gray-200">
                      {t("comparison.rows.mistakeAnalysis.label")}
                    </td>
                    <td className="p-6 text-center text-gray-600 dark:text-gray-400">
                      {t("comparison.rows.mistakeAnalysis.free")}
                    </td>
                    <td className="p-6 text-center font-bold text-blue-600 dark:text-blue-400">
                      {t("comparison.rows.mistakeAnalysis.beta")}
                    </td>
                  </tr>
                  <tr className="bg-gray-50/30 dark:bg-white/5">
                    <td className="p-6 font-medium dark:text-gray-200">
                      {t("comparison.rows.pdfExport.label")}
                    </td>
                    <td className="p-6 text-center text-gray-400 text-2xl">
                      <span className="sr-only">{t("comparison.notIncludedSrOnly")}</span>
                      &minus;
                    </td>
                    <td className="p-6 text-center text-blue-600 dark:text-blue-400 text-2xl">
                      <div className="flex justify-center">
                        <CheckCircle2 className="size-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </td>
                  </tr>
                  <tr className="bg-gray-50/30 dark:bg-white/5">
                    <td className="p-6 font-medium dark:text-gray-200">
                      {t("comparison.rows.newFeatures.label")}
                    </td>
                    <td className="p-6 text-center text-gray-400 text-2xl">
                      <span className="sr-only">{t("comparison.notIncludedSrOnly")}</span>
                      &minus;
                    </td>
                    <td className="p-6 text-center font-medium text-blue-600 dark:text-blue-400">
                      {t("comparison.rows.newFeatures.beta")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </GlassPanel>
        </section>

        {/* Pricing FAQ Section */}
        <FAQSection className="mt-16 bg-white/50 dark:bg-black/20" />
      </main>

      <Footer />
    </>
  );
}
