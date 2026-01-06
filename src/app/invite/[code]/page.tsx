import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Gift, ArrowRight, CheckCircle2 } from "lucide-react";

interface PageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function InvitePage(props: PageProps) {
  const params = await props.params;
  const { code: rawCode } = params;
  // Normalize code to uppercase (codes are generated as uppercase)
  const code = rawCode.toUpperCase();

  const supabase = await createClient();

  // 1. Verify code exists
  // RLS policies allow: anyone to lookup referral_codes, and anyone to view public profile fields
  const { data: referral, error } = await supabase
    .from("referral_codes")
    .select("user_id")
    .eq("code", code)
    .single();

  // Explicitly cast to avoid 'never' inference if types aren't fully generated
  const referralData = referral as { user_id: string } | null;

  if (!referralData || error) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-[#f0f4fc] dark:bg-slate-950 overflow-hidden">
        <AmbientBackground />
        <GlassPanel className="max-w-md w-full p-8 text-center space-y-6">
          <div className="mx-auto size-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Gift className="size-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Invalid Invite Link
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            This invitation link seems to be invalid or expired.
          </p>
          <Link href="/">
            <Button className="w-full">Go Home</Button>
          </Link>
        </GlassPanel>
      </div>
    );
  }

  // 2. Get referrer's profile info
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", referralData.user_id)
    .single();

  const profileData = profile as {
    username: string;
    avatar_url: string;
  } | null;

  const referrerName = profileData?.username || "A friend";
  const avatarUrl = profileData?.avatar_url;

  // 3. Check if current user is already logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // If logged in, they can't be referred (assuming new users only for now, or we just redirect)
    // The plan implies "register" to unlock, so existing users might not qualify unless we allow it.
    // For now, let's redirect them to dashboard but maybe show a message?
    // Or we could allow linking if they haven't been referred yet?
    // Plan says "邀请1人成功注册", so it implies new users.
    redirect("/library");
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-[#f0f4fc] dark:bg-slate-900 overflow-hidden">
      <AmbientBackground />

      <div className="relative z-10 w-full max-w-lg">
        <GlassPanel className="p-8 md:p-10 text-center space-y-8 shadow-2xl border-white/40 dark:border-white/10">
          {/* Avatar / Icon */}
          <div className="relative mx-auto">
            {avatarUrl ? (
              <div
                className="mx-auto size-24 rounded-full bg-cover bg-center border-4 border-white dark:border-slate-800 shadow-xl"
                style={{ backgroundImage: `url("${avatarUrl}")` }}
              />
            ) : (
              <div className="mx-auto size-24 rounded-full bg-blue-600 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-xl text-white font-bold text-3xl">
                {referrerName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full border-4 border-white dark:border-slate-800">
              <Gift className="size-5" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {referrerName} invited you!
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400">
              Join StudyPilot and get exclusive access to premium question
              banks.
            </p>
          </div>

          {/* Value Props */}
          <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-6 text-left space-y-4 border border-white/20 dark:border-white/5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Unlock a Premium Bank
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Get instant access to a paid question bank for free.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Track Your Progress
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Advanced analytics to help you master every topic.
                </span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4 pt-4">
            <Link
              href={`/login?mode=signup&referral_code=${code}`}
              className="block w-full"
            >
              <Button className="w-full h-14 text-lg bg-[#135bec] hover:bg-blue-600 shadow-xl shadow-blue-500/30 rounded-xl gap-2 animate-pulse-subtle">
                Accept Invite & Join
                <ArrowRight className="size-5" />
              </Button>
            </Link>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              By joining, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
