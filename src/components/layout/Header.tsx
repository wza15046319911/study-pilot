"use client";

import Link from "next/link";
import Image from "next/image";
import { Moon, Sun, Crown } from "lucide-react";
import { useTheme } from "next-themes";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface HeaderProps {
  showNav?: boolean;
  isAdmin?: boolean;
  user?: {
    username: string;
    avatar_url?: string;
    is_vip?: boolean;
  } | null;
}

export function Header({ showNav = true, isAdmin = false, user }: HeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const t = useTranslations("nav");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/20 dark:border-gray-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/study-pilot-icon.png"
              alt="StudyPilot Logo"
              width={40}
              height={40}
              className="rounded-xl shadow-lg shadow-blue-500/30"
            />
            <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">
              StudyPilot
            </h2>
          </Link>
          {showNav && (
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/subjects"
                className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium"
              >
                {t("subjects")}
              </Link>
              <Link
                href="/pricing"
                className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium"
              >
                {t("pricing")}
              </Link>
              <Link
                href="/question-banks"
                className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium"
              >
                Banks
              </Link>
              <Link
                href="/profile/bookmarks"
                className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium"
              >
                {t("bookmarks")}
              </Link>
              <Link
                href="/profile/mistakes"
                className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium"
              >
                {t("mistakes")}
              </Link>
              <Link
                href="/profile/referrals"
                className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium"
              >
                Referrals
              </Link>
              <Link
                href="/profile"
                className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium"
              >
                {t("profile")}
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium"
                >
                  Admin
                </Link>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <button
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {mounted && resolvedTheme === "dark" ? (
                <Sun className="size-5" />
              ) : (
                <Moon className="size-5" />
              )}
            </button>

            {user ? (
              <>
                <Link href="/profile" className="flex items-center gap-3 group">
                  <div className="text-right hidden sm:block">
                    <div className="flex items-center justify-end gap-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {user.username}
                      </p>
                      {user.is_vip && (
                        <Crown
                          className="size-3 text-amber-500 fill-amber-500"
                          strokeWidth={2.5}
                        />
                      )}
                    </div>
                    {user.is_vip && (
                      <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider leading-none">
                        VIP Member
                      </p>
                    )}
                  </div>
                  <div className="relative">
                    <div
                      className={`bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 shadow-sm cursor-pointer transition-all ${
                        user.is_vip
                          ? "border-amber-400 dark:border-amber-500 ring-2 ring-amber-100 dark:ring-amber-900/30"
                          : "border-white dark:border-gray-700 bg-gradient-to-br from-blue-400 to-purple-500 group-hover:ring-2 group-hover:ring-[#135bec] dark:group-hover:ring-blue-500"
                      }`}
                      style={
                        user.avatar_url
                          ? { backgroundImage: `url("${user.avatar_url}")` }
                          : undefined
                      }
                    />
                    {user.is_vip && (
                      <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white p-0.5 rounded-full ring-2 ring-white dark:ring-slate-900">
                        <Crown className="size-2.5 fill-white" />
                      </div>
                    )}
                  </div>
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-[#135bec] hover:bg-[#0e45b8] text-white font-semibold h-10 px-5 rounded-lg shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] flex items-center justify-center"
              >
                {t("login")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
