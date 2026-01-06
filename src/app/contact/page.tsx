import { Mail } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
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

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <AmbientBackground />
      <Header showNav={true} user={userData} isAdmin={isAdmin} />

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-800 text-center">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Contact Us
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              We're here to help! Reach out via email or connect on WeChat.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Email Section */}
            <div className="flex flex-col items-center p-6 bg-blue-50 dark:bg-slate-800/50 rounded-2xl">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full text-blue-600 dark:text-blue-400 mb-4">
                <Mail className="size-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Email Support
              </h2>
              <a
                href="mailto:cpuzianwang@gmail.com"
                className="text-blue-600 dark:text-blue-400 font-medium hover:underline text-lg"
              >
                cpuzianwang@gmail.com
              </a>
            </div>

            {/* WeChat QR Section */}
            <div className="flex flex-col items-center p-6 bg-emerald-50 dark:bg-slate-800/50 rounded-2xl">
              <div className="relative size-40 bg-white p-2 rounded-xl shadow-sm mb-4">
                <img
                  src="/qrcode.png"
                  alt="WeChat QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                WeChat Support
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Scan to connect
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
