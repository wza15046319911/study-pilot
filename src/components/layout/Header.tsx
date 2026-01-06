"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Moon,
  Sun,
  Crown,
  User,
  Bookmark,
  Gift,
  AlertCircle,
  LogOut,
} from "lucide-react";
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
  // Ensure we only render theme-dependent UI after mounting to prevent hydration mismatch
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
                href="/library"
                className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium"
              >
                Library
              </Link>
              <Link
                href="/pricing"
                className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium"
              >
                {t("pricing")}
              </Link>
              <Link
                href="/contact"
                className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium"
              >
                Contact Us
              </Link>
              <Link
                href="/blog"
                className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium"
              >
                Blog
              </Link>
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle Dropdown */}
            <div className="group relative">
              <button
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
              >
                {mounted && resolvedTheme === "dark" ? (
                  <Moon className="size-5" />
                ) : (
                  <Sun className="size-5" />
                )}
              </button>

              {/* Dropdown */}
              <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="w-36 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden p-1.5">
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      mounted && theme === "light"
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Sun className="size-4" />
                    Light
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      mounted && theme === "dark"
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Moon className="size-4" />
                    Dark
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      mounted && theme === "system"
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                    System
                  </button>
                </div>
              </div>
            </div>

            {user ? (
              <>
                <div className="group relative">
                  <Link href="/profile" className="flex items-center gap-3">
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
                            : "border-white dark:border-gray-700 bg-slate-100 dark:bg-slate-800 group-hover:ring-2 group-hover:ring-slate-200 dark:group-hover:ring-slate-700"
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

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                    <div className="w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
                      {/* Mobile User Info (Show only on small screens) */}
                      <div className="sm:hidden p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-slate-800/50">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {user.username}
                        </p>
                        {user.is_vip && (
                          <p className="text-xs text-amber-500 font-bold uppercase">
                            VIP Member
                          </p>
                        )}
                      </div>

                      <div className="p-1.5">
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <User className="size-4 text-blue-500" />
                          {t("profile")}
                        </Link>
                        <Link
                          href="/profile/bookmarks"
                          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Bookmark className="size-4 text-purple-500" />
                          {t("bookmarks")}
                        </Link>
                        <Link
                          href="/profile/mistakes"
                          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <AlertCircle className="size-4 text-red-500" />
                          {t("mistakes")}
                        </Link>
                        <Link
                          href="/profile/referrals"
                          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Gift className="size-4 text-green-500" />
                          Referrals
                        </Link>
                      </div>

                      <div className="p-1.5 border-t border-gray-100 dark:border-gray-800">
                        <Link
                          href="/login" // Typically logout redirects to login or has a handler. Using login for now as a safe fallback or placeholder.
                          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group/logout"
                        >
                          <LogOut className="size-4 group-hover/logout:translate-x-1 transition-transform" />
                          {t("logout") || "Log out"}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
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
