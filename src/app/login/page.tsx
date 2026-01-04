"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { GraduationCap, Mail, Lock, Check } from "lucide-react";
import { LoginVisuals } from "./LoginVisuals";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Get referral code from URL
  const referralCode = searchParams.get("referral_code");
  const modeParam = searchParams.get("mode");

  // "password" = password login
  // "signup" = password signup
  const [authMode, setAuthMode] = useState<"password" | "signup">(
    modeParam === "signup" ? "signup" : "password"
  );

  useEffect(() => {
    if (modeParam === "signup") {
      setAuthMode("signup");
    }
  }, [modeParam]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handlePasswordLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      router.push("/subjects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            referral_code: referralCode, // Pass referral code to metadata
          },
        },
      });

      if (error) throw error;
      setMessage("Account created! Please check your email/login.");
      // Auto login often works unless email confirm is strictly enforced
      router.push("/subjects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
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

  return (
    <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2">
      <div className="w-full max-w-[380px] space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {authMode === "signup" ? "Create an account" : "Welcome back!"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Please enter your details
          </p>
          {referralCode && authMode === "signup" && (
            <div className="bg-green-50 text-green-600 px-3 py-1 rounded text-sm font-medium inline-block">
              Referral code applied
            </div>
          )}
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-4">
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
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                htmlFor="password"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="rounded-lg border-gray-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {authMode === "password" && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`size-4 rounded border cursor-pointer flex items-center justify-center transition-colors ${
                    rememberMe
                      ? "bg-blue-600 border-blue-600"
                      : "border-gray-300"
                  }`}
                >
                  {rememberMe && <Check className="size-3 text-white" />}
                </div>
                <span
                  className="text-gray-500 cursor-pointer select-none"
                  onClick={() => setRememberMe(!rememberMe)}
                >
                  Remember for 30 days
                </span>
              </div>
              <button
                type="button"
                className="font-semibold text-gray-900 dark:text-white hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          {message && (
            <p className="text-green-600 text-sm text-center">{message}</p>
          )}

          <Button
            className="w-full h-11 bg-gray-900 hover:bg-black text-white rounded-lg font-medium"
            onClick={
              authMode === "password" ? handlePasswordLogin : handleSignUp
            }
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : authMode === "password"
              ? "Log in"
              : "Sign Up"}
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

          <p className="text-center text-sm text-gray-500">
            {authMode === "password" ? (
              <>
                Don&apos;t have an account?{" "}
                <span
                  onClick={() => setAuthMode("signup")}
                  className="font-bold text-gray-900 dark:text-white cursor-pointer hover:underline"
                >
                  Sign up
                </span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span
                  onClick={() => setAuthMode("password")}
                  className="font-bold text-gray-900 dark:text-white cursor-pointer hover:underline"
                >
                  Log in
                </span>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-slate-900">
      <Suspense fallback={<div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2">Loading...</div>}>
        <LoginForm />
      </Suspense>

      {/* Right: Visuals */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 dark:bg-slate-800">
        <LoginVisuals />
      </div>
    </div>
  );
}
