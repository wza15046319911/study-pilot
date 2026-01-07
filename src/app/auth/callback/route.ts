import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const referralCode = searchParams.get("referral_code");
  const next = searchParams.get("next") ?? "/library";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const newSessionId = randomUUID();
        const { error: sessionError } = await supabase
          .from("profiles")
          .update({ active_session_id: newSessionId })
          .eq("id", user.id);

        if (sessionError) {
          console.error("Failed to update active session", sessionError);
        }

        if (referralCode) {
          try {
            // 1. Find referrer
            const { data: referral } = await (
              supabase.from("referral_codes") as any
            )
              .select("user_id")
              .eq("code", referralCode)
              .single();

            if (referral && referral.user_id !== user.id) {
              // 2. Check if already referred
              const { data: existing } = await supabase
                .from("referrals")
                .select("id")
                .eq("referee_id", user.id)
                .single();

              if (!existing) {
                // 3. Create referral record
                await (supabase.from("referrals") as any).insert({
                  referrer_id: referral.user_id,
                  referee_id: user.id,
                  referral_code: referralCode,
                });
              }
            }
          } catch (e) {
            console.error("Error processing referral in callback:", e);
            // Don't block login on referral error
          }
        }

        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
