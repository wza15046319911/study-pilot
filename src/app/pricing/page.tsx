import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Header } from "@/components/layout/Header";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { CheckCircle2, XCircle, Zap, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/types/database";

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userData = null;
  let isAdmin = false;

  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
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
    };
    isAdmin =
      !!process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL;
  }

  const tiers = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for getting started",
      features: [
        "Access to basic question banks",
        "Standard practice mode",
        "Basic progress tracking",
        "Community support",
      ],
      notIncluded: [
        "Premium question banks",
        "Immersive flow mode",
        "Advanced mistake analysis",
        "Unlimited flashcards",
      ],
      cta: "Get Started",
      variant: "default",
    },
    {
      name: "Lifetime Access",
      price: "$49.99",
      period: "one-time",
      popular: true,
      description: "Pay once, own it forever. No subscriptions.",
      features: [
        "Access to ALL question banks",
        "Immersive flow mode",
        "Advanced mistake analysis",
        "Unlimited flashcards",
        "Priority support",
        "Detailed performance analytics",
        "Future updates included",
      ],
      cta: "Buy Now",
      variant: "primary",
    },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <AmbientBackground />
      <Header showNav={true} user={userData} isAdmin={isAdmin} />

      <main className="flex-grow w-full pt-20 pb-20 px-4">
        <section className="max-w-7xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 mb-6">
            <Zap className="size-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
              Launch Special
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 dark:text-white tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Choose the plan that fits your study needs. No hidden fees.
          </p>
        </section>

        <section className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 px-4 items-start">
          {tiers.map((tier) => (
            <GlassPanel
              key={tier.name}
              variant="card"
              className={`p-8 flex flex-col relative transition-all duration-300 ${
                tier.popular
                  ? "border-blue-500/50 dark:border-blue-500 ring-4 ring-blue-500/10 shadow-2xl scale-105 z-10"
                  : "hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                  <ShieldCheck className="size-4" />
                  Best Value
                </div>
              )}
              <div className="mb-8 text-center">
                <h3 className="text-xl font-bold mb-2 dark:text-white">
                  {tier.name}
                </h3>
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                      {tier.period}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
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

              <button
                className={`w-full py-4 rounded-xl font-bold transition-all duration-200 ${
                  tier.popular
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5"
                    : "bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-gray-200 dark:border-slate-700"
                }`}
              >
                {tier.cta}
              </button>

              {tier.popular && (
                <p className="text-xs text-center text-gray-400 mt-4">
                  One-time payment. 30-day money-back guarantee.
                </p>
              )}
            </GlassPanel>
          ))}
        </section>

        {/* Comparison Table */}
        <section className="max-w-5xl mx-auto px-4 mt-24 mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">
            Compare Features
          </h2>
          <GlassPanel className="overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
                    <th className="p-6 text-sm font-semibold text-slate-500 dark:text-slate-400 w-1/3">
                      Features
                    </th>
                    <th className="p-6 text-lg font-bold text-slate-900 dark:text-white w-1/3 text-center">
                      Free
                    </th>
                    <th className="p-6 text-lg font-bold text-blue-600 dark:text-blue-400 w-1/3 text-center">
                      Lifetime
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
                  </tr>
                  <tr>
                    <td className="p-6 font-medium dark:text-gray-200">
                      Explanations
                    </td>
                    <td className="p-6 text-center text-gray-600 dark:text-gray-400">
                      Basic
                    </td>
                    <td className="p-6 text-center font-bold text-blue-600 dark:text-blue-400">
                      Detailed & AI-Powered
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
                  </tr>
                </tbody>
              </table>
            </div>
          </GlassPanel>
        </section>
      </main>
    </div>
  );
}
