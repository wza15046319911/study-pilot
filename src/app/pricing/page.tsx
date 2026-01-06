import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Header } from "@/components/layout/Header";
import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  CheckCircle2,
  XCircle,
  Zap,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/types/database";
import { PricingContent } from "./PricingContent";

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

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <AmbientBackground />
      <Header showNav={true} user={userData} isAdmin={isAdmin} />
      <PricingContent />
    </div>
  );
}
