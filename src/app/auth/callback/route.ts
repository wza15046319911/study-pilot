import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Validate redirect path to prevent open redirect attacks
function getSafeRedirectPath(path: string | null): string {
  const defaultPath = "/library";

  if (!path) return defaultPath;

  // Must start with / and not contain protocol or double slashes
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("://") ||
    path.includes("\\")
  ) {
    return defaultPath;
  }

  // Only allow alphanumeric, hyphens, underscores, slashes, and query strings
  const safePathRegex = /^\/[a-zA-Z0-9\-_\/\?=&%]*$/;
  if (!safePathRegex.test(path)) {
    return defaultPath;
  }

  return path;
}

// Validate referral code format
function isValidReferralCode(code: string | null): boolean {
  if (!code) return false;
  return /^[A-Z0-9]{6}$/.test(code);
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const referralCode = searchParams.get("referral_code");
  const next = getSafeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const newSessionId = randomUUID();
        const { error: sessionError } = await (supabase.from("profiles") as any)
          .update({ active_session_id: newSessionId })
          .eq("id", user.id);

        if (sessionError) {
          console.error("Failed to update active session", sessionError);
        }

        if (referralCode && isValidReferralCode(referralCode)) {
          try {
            // 1. Find referrer
            const { data: referral } = await (
              supabase.from("referral_codes") as any
            )
              .select("user_id")
              .eq("code", referralCode.toUpperCase())
              .single();

            if (referral && referral.user_id !== user.id) {
              // 2. Check if already referred
              const { data: existing } = await (
                supabase.from("referrals") as any
              )
                .select("id")
                .eq("referee_id", user.id)
                .single();

              if (!existing) {
                // 3. Create referral record
                await (supabase.from("referrals") as any).insert({
                  referrer_id: referral.user_id,
                  referee_id: user.id,
                  referral_code: referralCode.toUpperCase(),
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
