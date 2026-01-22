import Link from "next/link";
import { CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Header } from "@/components/layout/Header";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/types/database";

export default async function PaymentSuccessPage() {
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

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <AmbientBackground />
      <Header showNav={true} user={userData} isAdmin={isAdmin} />

      <main className="flex-grow flex items-center justify-center px-4 py-20">
        <GlassPanel className="max-w-lg w-full p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
              <div className="relative rounded-full bg-green-500 p-4">
                <CheckCircle2 className="size-12 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold mb-3 dark:text-white">
            Welcome to VIP! 🎉
          </h1>

          {/* Description */}
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Your payment was successful. You now have lifetime access to all
            premium features!
          </p>

          {/* Features unlocked */}
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold mb-3">
              <Sparkles className="size-5" />
              <span>Features Unlocked</span>
            </div>
            <ul className="text-left text-sm space-y-2 text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-500 flex-shrink-0" />
                Unlimited access to ALL subjects
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-500 flex-shrink-0" />
                AI-powered explanations
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-500 flex-shrink-0" />
                Unlimited mock exams
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-500 flex-shrink-0" />
                Immersive study mode
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-500 flex-shrink-0" />
                All future updates free
              </li>
            </ul>
          </div>

          {/* CTA */}
          <Link
            href="/library"
            className="inline-flex items-center gap-2 w-full justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-[background-color,box-shadow] duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl"
          >
            Start Learning
            <ArrowRight className="size-5" />
          </Link>

          <p className="text-xs text-slate-500 dark:text-slate-500 mt-4">
            A confirmation email has been sent to your inbox.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            Changed your mind? We offer a 30-day money-back guarantee.{" "}
            <Link href="/contact" className="text-blue-500 hover:underline">
              Contact us
            </Link>{" "}
            for a full refund.
          </p>
        </GlassPanel>
      </main>
    </div>
  );
}
