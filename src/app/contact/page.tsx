import { Mail, MessageCircle, MapPin, Clock } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { FAQSection } from "@/components/common/FAQSection";
import { Footer } from "@/components/layout/Footer";
import { getHeaderUser } from "@/lib/auth/getHeaderUser";

export default async function ContactPage() {
  const headerUser = await getHeaderUser();

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50 dark:bg-slate-950">
      <Header showNav={true} user={headerUser} />

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

        <FAQSection className="mt-24" />
      </main>

      <Footer />
    </div>
  );
}
