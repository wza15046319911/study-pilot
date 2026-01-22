"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { LoginVisuals } from "./LoginVisuals";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "sent">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get referral code from URL
  const referralCode = searchParams.get("referral_code");

  const handleMagicLink = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${
            window.location.origin
          }/auth/callback?referral_code=${referralCode || ""}`,
        },
      });

      if (error) throw error;
      setStep("sent");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send login link"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?referral_code=${
            referralCode || ""
          }`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google login failed");
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?referral_code=${
            referralCode || ""
          }`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "GitHub login failed");
      setLoading(false);
    }
  };

  // Step 2: Email sent confirmation
  if (step === "sent") {
    return (
      <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-[380px] space-y-8">
          <div className="text-center space-y-4">
            <div className="mx-auto size-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="size-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Check your email
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              We sent a login link to
              <br />
              <span className="font-medium text-gray-900 dark:text-white">
                {email}
              </span>
            </p>
          </div>

          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border-gray-200 rounded-lg text-gray-700 dark:text-white font-medium bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
              onClick={() => {
                setStep("email");
                setEmail("");
              }}
            >
              <ArrowLeft className="size-4 mr-2" />
              Back to login
            </Button>

            <p className="text-center text-sm text-gray-500">
              Didn&apos;t receive the email?{" "}
              <button
                onClick={handleMagicLink}
                disabled={loading}
                className="font-bold text-gray-900 dark:text-white hover:underline"
              >
                {loading ? "Sending..." : "Resend"}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Email input
  return (
    <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2">
      <div className="w-full max-w-[380px] space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Welcome to StudyPilot
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Sign in to continue to your account
          </p>
          {referralCode && (
            <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1 rounded text-sm font-medium inline-block">
              Referral code applied
            </div>
          )}
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
              htmlFor="email"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="rounded-lg border-gray-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleMagicLink();
              }}
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button
            className="w-full h-11 bg-gray-900 hover:bg-black text-white rounded-lg font-medium gap-2"
            onClick={handleMagicLink}
            disabled={loading}
          >
            <Mail className="size-4" />
            {loading ? "Sending..." : "Continue with Email"}
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-2 text-gray-400">
                OR
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11 border-gray-200 rounded-lg gap-2 text-gray-700 dark:text-white font-medium bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="size-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11 border-gray-200 rounded-lg gap-2 text-gray-700 dark:text-white font-medium bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
            onClick={handleGitHubLogin}
            disabled={loading}
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Sign in with GitHub
          </Button>

          <p className="text-center text-xs text-gray-400">
            By continuing, you agree to our{" "}
            <a href="/terms" className="underline hover:text-gray-600">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline hover:text-gray-600">
              Privacy Policy
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-slate-900">
      <Suspense
        fallback={
          <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2">
            Loading…
          </div>
        }
      >
        <LoginForm />
      </Suspense>

      {/* Right: Visuals */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 dark:bg-slate-800">
        <LoginVisuals />
      </div>
    </div>
  );
}
