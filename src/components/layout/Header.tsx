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
  Menu,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslations } from "next-intl";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/Button";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

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

          {/* Desktop Navigation */}
          {showNav && (
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/library"
                className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium"
              >
                Library
              </Link>
              <Link
                href="/calendar"
                className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium"
              >
                Calendar
              </Link>
              <Link
                href="/pricing"
                className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium"
              >
                {t("pricing")}
              </Link>
              <Link
                href="/about"
                className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium"
              >
                Contact Us
              </Link>
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="size-6" />
              ) : (
                <Menu className="size-6" />
              )}
            </button>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* <LanguageSwitcher /> */}

              {/* Theme Toggle Dropdown */}
              <div className="group relative focus-within:opacity-100 focus-within:visible">
                <button
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Toggle theme"
                >
                  {mounted && resolvedTheme === "dark" ? (
                    <Moon className="size-5" />
                  ) : (
                    <Sun className="size-5" />
                  )}
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible focus-within:opacity-100 focus-within:visible transition-all duration-200 z-50">
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
                        <rect
                          x="2"
                          y="3"
                          width="20"
                          height="14"
                          rx="2"
                          ry="2"
                        />
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
                  <div className="group relative focus-within:opacity-100 focus-within:visible">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
                    >
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
                    <div className="absolute right-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible focus-within:opacity-100 focus-within:visible transition-all duration-200 transform origin-top-right z-50">
                      <div className="w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
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
                            href="/login"
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
                <Link href="/login">
                  <Button variant="primary" size="sm">
                    {t("login")}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Content */}
          <div
            ref={mobileMenuRef}
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-200"
          >
            <div className="flex items-center justify-between mb-8">
              <Link
                href="/"
                className="flex items-center gap-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Image
                  src="/study-pilot-icon.png"
                  alt="StudyPilot Logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="font-bold text-lg text-slate-900 dark:text-white">
                  StudyPilot
                </span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="size-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* User Section (Mobile) */}
              {user ? (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="bg-center bg-no-repeat bg-cover rounded-full size-10 border border-slate-200 dark:border-slate-700"
                      style={
                        user.avatar_url
                          ? { backgroundImage: `url("${user.avatar_url}")` }
                          : undefined
                      }
                    />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {user.username}
                      </p>
                      {user.is_vip && (
                        <p className="text-xs text-amber-500 font-bold uppercase">
                          VIP Member
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="size-4 text-blue-500" />
                      {t("profile")}
                    </Link>
                    <Link
                      href="/profile/bookmarks"
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Bookmark className="size-4 text-purple-500" />
                      {t("bookmarks")}
                    </Link>
                    <Link
                      href="/profile/mistakes"
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <AlertCircle className="size-4 text-red-500" />
                      {t("mistakes")}
                    </Link>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full"
                >
                  <Button className="w-full">{t("login")}</Button>
                </Link>
              )}

              <div className="space-y-1">
                <p className="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Menu
                </p>
                <Link
                  href="/library"
                  className="block px-3 py-2 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Library
                </Link>
                <Link
                  href="/calendar"
                  className="block px-3 py-2 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Calendar
                </Link>
                <Link
                  href="/pricing"
                  className="block px-3 py-2 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("pricing")}
                </Link>
                <Link
                  href="/about"
                  className="block px-3 py-2 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="block px-3 py-2 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact Us
                </Link>
                <Link
                  href="/blog"
                  className="block px-3 py-2 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Blog
                </Link>
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between px-3">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Theme
                  </span>
                  <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    <button
                      onClick={() => setTheme("light")}
                      className={`p-1.5 rounded-md ${
                        theme === "light"
                          ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600"
                          : "text-slate-500"
                      }`}
                    >
                      <Sun className="size-4" />
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={`p-1.5 rounded-md ${
                        theme === "dark"
                          ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600"
                          : "text-slate-500"
                      }`}
                    >
                      <Moon className="size-4" />
                    </button>
                    <button
                      onClick={() => setTheme("system")}
                      className={`p-1.5 rounded-md ${
                        theme === "system"
                          ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600"
                          : "text-slate-500"
                      }`}
                    >
                      <span className="sr-only">System</span>
                      <svg
                        className="size-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="2"
                          y="3"
                          width="20"
                          height="14"
                          rx="2"
                          ry="2"
                        />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {user && (
                <div className="pt-2 px-3">
                  <Link
                    href="/login"
                    className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400"
                  >
                    <LogOut className="size-4" />
                    {t("logout")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
