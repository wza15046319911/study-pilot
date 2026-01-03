"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { GraduationCap, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async () => {
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
          shouldCreateUser: true,
        },
      });

      if (error) throw error;
      setStep("code");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send verification code"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      setError("Please enter the verification code");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });

      if (error) throw error;
      router.push("/subjects");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid verification code"
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
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#eff6ff] via-[#f8faff] to-white dark:from-[#0f172a] dark:to-[#1e293b]" />
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-blue-300/20 rounded-full blur-[80px]" />
      </div>

      <GlassPanel className="w-full max-w-[440px] shadow-lg p-8 sm:p-10 relative z-10 flex flex-col gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center text-center gap-4">
          <Link
            href="/"
            className="size-14 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30"
          >
            <GraduationCap className="size-8" />
          </Link>
          <div className="space-y-1.5">
            <h1 className="text-[28px] font-bold leading-tight">
              Welcome Back
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-normal">
              {step === "email"
                ? "Enter your email to receive a verification code"
                : "Enter the verification code sent to your email"}
            </p>
          </div>
        </div>

        {/* Form */}
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="space-y-2">
            <label
              className="text-sm font-medium pl-1 text-slate-700 dark:text-slate-300"
              htmlFor="email"
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="example@quizmaster.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={step === "code"}
              icon={<Mail className="size-5" />}
            />
          </div>

          {step === "code" && (
            <div className="space-y-2">
              <label
                className="text-sm font-medium pl-1 text-slate-700 dark:text-slate-300"
                htmlFor="code"
              >
                Verification Code
              </label>
              <div className="flex gap-3">
                <Input
                  id="code"
                  type="text"
                  placeholder="6-digit code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  icon={<Lock className="size-5" />}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSendCode}
                  disabled={loading}
                  className="whitespace-nowrap"
                >
                  Resend
                </Button>
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="pt-2">
            {step === "email" ? (
              <Button
                type="button"
                className="w-full"
                onClick={handleSendCode}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Code"}
              </Button>
            ) : (
              <Button
                type="button"
                className="w-full"
                onClick={handleVerifyCode}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Sign In"}
              </Button>
            )}
          </div>
        </form>

        {/* Divider */}
        <div className="flex flex-col gap-5">
          <div className="relative flex items-center">
            <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
            <span className="px-4 text-sm text-slate-500 dark:text-slate-400">
              or
            </span>
            <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
          </div>

          {/* Google Login */}
          <Button
            type="button"
            variant="secondary"
            className="w-full gap-3"
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
            Continue with Google
          </Button>
        </div>

        {/* Back to home */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?
          <Link
            href="/"
            className="text-blue-600 font-medium ml-1 hover:underline"
          >
            Sign up free
          </Link>
        </p>
      </GlassPanel>
    </div>
  );
}
