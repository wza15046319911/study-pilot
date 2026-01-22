import {
  Mail,
  MessageCircle,
  MapPin,
  Clock,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/types/database";

export default async function ContactPage() {
  const supabase = await createClient();

  // Check for session
  let user = null;
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch (error) {
    console.error("Auth error:", error);
  }

  let userData = null;
  let isAdmin = false;

  if (user) {
    // Fetch profile
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
      is_vip: profile?.is_vip || false,
    };

    isAdmin =
      !!process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL;
  }

  const faqs = [
    {
      q: "How do I unlock premium features?",
      a: "You can upgrade to StudyPilot Premium from the pricing page. We offer a simple one-time payment for lifetime access.",
    },
    {
      q: "Can I get a refund?",
      a: "Yes, we offer a 30-day money-back guarantee if you're not satisfied with StudyPilot.",
    },
    {
      q: "Do you offer student discounts?",
      a: "Our standard pricing is already optimized for students, but look out for our seasonal Early Bird specials!",
    },
    {
      q: "How can I report a question error?",
      a: "Every question has a report button. You can flag issues directly there and our team will review it within 24 hours.",
    },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50 dark:bg-slate-950">
      <Header showNav={true} user={userData} isAdmin={isAdmin} />

      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-24">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-32">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-bold mb-6">
            <MessageCircle className="size-4" />
            <span>We'd love to hear from you</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">
            Get in touch
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed text-balance">
            Have a question about StudyPilot or just want to say hello? We're
            here to help you every step of the way.
          </p>
        </div>

        {/* Support Channels Grid */}
        <div className="grid md:grid-cols-2 gap-12 mb-32">
          {/* Email Support */}
          <div className="group bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-[box-shadow,transform] duration-300 hover:-translate-y-1">
            <div className="size-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Mail className="size-7" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Email Support
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              For general inquiries, technical support, or partnership
              opportunities. We typically respond within 12 hours.
            </p>
            <div>
              <a
                href="mailto:zianwang9911@gmail.com"
                className="text-lg font-bold text-slate-900 dark:text-white border-b-2 border-blue-500/30 hover:border-blue-500 transition-colors pb-1"
              >
                zianwang9911@gmail.com
              </a>
            </div>
          </div>

          {/* WeChat Support */}
          <div className="group bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-[box-shadow,transform] duration-300 hover:-translate-y-1">
            <div className="size-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <MessageCircle className="size-7" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              WeChat Community
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              Join our student community, get instant updates, or chat with our
              support team directly.
            </p>
            <div className="flex items-center gap-6">
              <div className="size-32 bg-slate-100 dark:bg-slate-800 rounded-xl p-2">
                <img
                  src="/qrcode.png"
                  alt="WeChat QR"
                  width={128}
                  height={128}
                  className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  Scan Code
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  Add Official Account
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Office & FAQ Section - 2 Columns */}
        <div className="grid lg:grid-cols-12 gap-20">
          {/* Left: Office Info */}
          <div className="lg:col-span-4 space-y-12">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <MapPin className="size-5 text-slate-400" />
                Office
              </h3>
              <div className="bg-slate-100 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white mb-2">
                  StudyPilot HQ
                </p>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  Melbourne, Victoria
                  <br />
                  Australia
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Clock className="size-5 text-slate-400" />
                Hours
              </h3>
              <div className="bg-slate-100 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Mon - Fri</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      9am - 6pm AEST
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Weekend</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      Closed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: FAQ */}
          <div className="lg:col-span-8">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
              <HelpCircle className="size-6 text-slate-400" />
              Frequently Asked Questions
            </h3>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                  <div className="p-6">
                    <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                      {faq.q}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
