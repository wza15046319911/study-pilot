import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  BadgeCheck,
  PlayCircle,
  CheckCircle2,
  Trophy,
  Database,
  BookOpen,
  Activity,
  Star,
  GraduationCap,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Profile, Subject } from "@/types/database";
import { getTranslations } from "next-intl/server";

export default async function Home() {
  const supabase = await createClient();

  // Check for session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userData = null;
  let isAdmin = false;

  if (user) {
    // Fetch profile
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

  // Fetch all subjects for the browse section
  const { data: subjectsData } = await supabase
    .from("subjects")
    .select("*")
    .order("name");

  const subjects = (subjectsData || []) as Subject[];
  const t = await getTranslations("home");

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <AmbientBackground />
      <Header showNav={false} user={userData} isAdmin={isAdmin} />

      <main className="flex-grow w-full">
        {/* Hero Section */}
        <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="flex flex-col gap-6 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 w-fit mx-auto lg:mx-0">
                <BadgeCheck className="text-[#135bec] dark:text-blue-400 size-5" />
                <span className="text-[#135bec] dark:text-blue-400 text-sm font-semibold">
                  2024 New Question Bank Updated
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-6">
                {t("title")}
              </h1>
              <p className="text-[#4c669a] dark:text-gray-400 text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                {t("subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Link
                  href="/login"
                  className="flex h-12 px-8 items-center justify-center rounded-xl bg-[#135bec] hover:bg-[#0e45b8] text-white text-base font-bold shadow-xl shadow-blue-600/25 transition-all transform hover:-translate-y-1"
                >
                  Start Free Practice
                </Link>
                <button className="flex h-12 px-8 items-center justify-center rounded-xl bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-[#0d121b] dark:text-white border border-gray-200 dark:border-slate-700 text-base font-bold shadow-sm transition-all">
                  <PlayCircle className="mr-2 text-gray-500 dark:text-gray-400 size-5" />
                  Watch Demo
                </button>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-4 pt-4 text-sm text-[#4c669a] dark:text-gray-400">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-gradient-to-br from-blue-400 to-purple-500" />
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-gradient-to-br from-green-400 to-cyan-500" />
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-gradient-to-br from-orange-400 to-pink-500" />
                </div>
                <p>
                  Join{" "}
                  <span className="font-bold text-[#0d121b] dark:text-white">
                    10,000+
                  </span>{" "}
                  users
                </p>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative lg:h-[500px] flex items-center justify-center">
              <GlassPanel
                variant="card"
                className="absolute top-10 right-10 w-64 h-80 z-20 p-5 flex flex-col gap-4 animate-bounce [animation-duration:4s]"
              >
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-3">
                  <div className="size-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400">
                    <CheckCircle2 className="size-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Completed Today
                    </p>
                    <p className="text-lg font-bold dark:text-white">
                      128 Questions
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[80%]" />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Accuracy</span>
                    <span className="font-bold text-[#0d121b] dark:text-white">
                      80%
                    </span>
                  </div>
                </div>
                <div className="mt-auto pt-4 flex gap-2">
                  <span className="inline-block px-2 py-1 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs rounded">
                    #DataStructures
                  </span>
                  <span className="inline-block px-2 py-1 bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 text-xs rounded">
                    #Algorithms
                  </span>
                </div>
              </GlassPanel>

              <div className="absolute inset-4 bg-gradient-to-tr from-blue-100 dark:from-blue-900/30 to-white dark:to-slate-900/30 rounded-[3rem] -z-10 opacity-60 border border-white/40 dark:border-slate-700" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
          id="features"
        >
          <div className="text-center mb-16">
            <h2 className="text-[#135bec] dark:text-blue-400 font-bold text-sm tracking-widest uppercase mb-3">
              Core Features
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black mb-4 dark:text-white">
              Why Choose StudyPilot
            </h3>
            <p className="text-[#4c669a] dark:text-gray-400 max-w-2xl mx-auto text-lg">
              Combining glassmorphism design with powerful practice features for
              the ultimate learning experience
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <GlassPanel
              variant="card"
              className="p-8 flex flex-col gap-4 group"
            >
              <div className="size-14 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#135bec] dark:text-blue-400 flex items-center justify-center mb-2 group-hover:bg-[#135bec] group-hover:text-white transition-colors duration-300">
                <Database className="size-8" />
              </div>
              <h4 className="text-xl font-bold dark:text-white">
                Massive Question Bank
              </h4>
              <p className="text-[#4c669a] dark:text-gray-400 leading-relaxed">
                Covering real exam questions and practice tests from all
                industries, updated regularly to ensure every question you
                practice is valuable and relevant.
              </p>
            </GlassPanel>

            <GlassPanel
              variant="card"
              className="p-8 flex flex-col gap-4 group"
            >
              <div className="size-14 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                <BookOpen className="size-8" />
              </div>
              <h4 className="text-xl font-bold dark:text-white">
                Mistake Management
              </h4>
              <p className="text-[#4c669a] dark:text-gray-400 leading-relaxed">
                Automatically collects mistakes and supports targeted
                reinforcement training to eliminate ineffective repetition and
                solidify your understanding.
              </p>
            </GlassPanel>

            <GlassPanel
              variant="card"
              className="p-8 flex flex-col gap-4 group"
            >
              <div className="size-14 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-2 group-hover:bg-cyan-600 group-hover:text-white transition-colors duration-300">
                <Activity className="size-8" />
              </div>
              <h4 className="text-xl font-bold dark:text-white">
                Flow State Practice
              </h4>
              <p className="text-[#4c669a] dark:text-gray-400 leading-relaxed">
                Enter Immersive Mode for distraction-free practice. Infinite
                scroll through random questions to build momentum and stay in
                the zone.
              </p>
            </GlassPanel>

            <GlassPanel
              variant="card"
              className="p-8 flex flex-col gap-4 group"
            >
              <div className="size-14 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mb-2 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                <PlayCircle className="size-8" />
              </div>
              <h4 className="text-xl font-bold dark:text-white">
                Flashcards & Rapid Review
              </h4>
              <p className="text-[#4c669a] dark:text-gray-400 leading-relaxed">
                Use our new Flashcards mode to quickly review key concepts and
                definitions. Flip through cards to test your memory retention
                efficiently.
              </p>
            </GlassPanel>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-10 px-4">
          <GlassPanel className="max-w-7xl mx-auto rounded-3xl p-8 sm:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-200/50 dark:divide-gray-700">
              <div className="flex flex-col gap-1">
                <span className="text-4xl font-black text-[#135bec] dark:text-blue-400">
                  500K+
                </span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Registered Users
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-4xl font-black text-[#135bec] dark:text-blue-400">
                  1000+
                </span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Question Categories
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-4xl font-black text-[#135bec] dark:text-blue-400">
                  98%
                </span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Pass Rate
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-4xl font-black text-[#135bec] dark:text-blue-400">
                  24h
                </span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Support Available
                </span>
              </div>
            </div>
          </GlassPanel>
        </section>

        {/* Browse Subjects Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold dark:text-white">
                Browse Subjects
              </h2>
              <p className="text-[#4c669a] dark:text-gray-400 mt-2">
                Start practicing with our comprehensive question banks
              </p>
            </div>
            <Link
              href="/subjects"
              className="text-[#135bec] hover:underline font-medium text-sm"
            >
              View All →
            </Link>
          </div>
          <div className="relative">
            <div
              className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {subjects.map((subject) => (
                <Link
                  key={subject.id}
                  href={`/practice/${subject.slug}/setup`}
                  className="flex-shrink-0 snap-start"
                >
                  <GlassPanel className="w-64 p-6 hover:shadow-xl transition-all hover:-translate-y-1 group cursor-pointer">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="size-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl">
                        {subject.icon || "📚"}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-[#0d121b] dark:text-white group-hover:text-[#135bec] transition-colors">
                          {subject.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {subject.question_count} questions
                        </p>
                      </div>
                    </div>
                    {subject.description && (
                      <p className="text-sm text-[#4c669a] dark:text-gray-400 line-clamp-2">
                        {subject.description}
                      </p>
                    )}
                    <div className="flex gap-2 mt-4">
                      {subject.is_new && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full font-medium">
                          New
                        </span>
                      )}
                      {subject.is_hot && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                          Hot
                        </span>
                      )}
                    </div>
                  </GlassPanel>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section
          className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
          id="reviews"
        >
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold dark:text-white">
                User Reviews
              </h2>
              <p className="text-[#4c669a] dark:text-gray-400 mt-2">
                See what our learners have to say
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Alex Johnson",
                role: "Software Engineer",
                stars: 5,
                text: "The interface design is incredibly clean, and the glassmorphism style is refreshing. Most importantly, the practice experience is great and the explanations are thorough!",
              },
              {
                name: "Sarah Chen",
                role: "CPA Candidate",
                stars: 5,
                text: "The mistake management system is excellent. It helps me focus exactly on what I don't know rather than wasting time on what I've already mastered.",
              },
              {
                name: "Mike Williams",
                role: "Graduate Student",
                stars: 4,
                text: "A great practice platform. The immersive mode helps me get into the zone and practice a large volume of questions without distraction.",
              },
            ].map((review, i) => (
              <GlassPanel
                key={i}
                variant="card"
                className="p-6 flex flex-col gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
                  <div>
                    <p className="font-bold dark:text-white">{review.name}</p>
                    <p className="text-xs text-[#4c669a] dark:text-gray-400">
                      {review.role}
                    </p>
                  </div>
                </div>
                <div className="flex text-yellow-400 gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={`size-5 ${
                        j < review.stars
                          ? "fill-current"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[#4c669a] dark:text-gray-400 text-sm leading-relaxed">
                  &ldquo;{review.text}&rdquo;
                </p>
              </GlassPanel>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto relative">
            <div className="absolute inset-0 bg-blue-500 blur-[80px] opacity-20 dark:opacity-10 rounded-full" />
            <GlassPanel className="relative rounded-3xl p-10 sm:p-16 text-center overflow-hidden border border-white/60 dark:border-gray-700">
              <div className="relative z-10 flex flex-col items-center gap-6">
                <h2 className="text-3xl sm:text-5xl font-black dark:text-white">
                  Ready to Start Your Journey?
                </h2>
                <p className="text-lg text-[#4c669a] dark:text-gray-400 max-w-2xl">
                  Sign up now for a 7-day VIP trial and unlock all premium
                  features and exclusive question banks.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
                  <input
                    className="h-12 px-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm min-w-[280px] focus:outline-none focus:ring-2 focus:ring-[#135bec]/50 text-sm dark:text-white dark:placeholder:text-gray-500"
                    placeholder="Enter your email address"
                    type="email"
                  />
                  <Link
                    href="/login"
                    className="h-12 px-8 rounded-xl bg-[#135bec] hover:bg-[#0e45b8] text-white font-bold shadow-lg shadow-blue-600/30 transition-all transform hover:scale-105 flex items-center justify-center"
                  >
                    Sign Up Now
                  </Link>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  No credit card required. Cancel anytime.
                </p>
              </div>
              <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-yellow-300 rounded-full blur-[40px] opacity-30" />
              <div className="absolute bottom-[-50px] right-[-50px] w-40 h-40 bg-purple-400 rounded-full blur-[50px] opacity-30" />
            </GlassPanel>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg border-t border-white/40 dark:border-gray-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/study-pilot-icon.png"
                  alt="StudyPilot Logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-xl font-bold dark:text-white">
                  StudyPilot
                </span>
              </div>
              <p className="text-[#4c669a] dark:text-gray-400 text-sm leading-relaxed max-w-xs mb-6">
                Dedicated to providing the best tools to improve learning
                efficiency, making every practice session more effective.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 dark:text-white">Product</h4>
              <ul className="space-y-3 text-sm text-[#4c669a] dark:text-gray-400">
                <li>
                  <a
                    className="hover:text-[#135bec] dark:hover:text-blue-400"
                    href="#"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-[#135bec] dark:hover:text-blue-400"
                    href="#"
                  >
                    Question Bank
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-[#135bec] dark:hover:text-blue-400"
                    href="#"
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 dark:text-white">Resources</h4>
              <ul className="space-y-3 text-sm text-[#4c669a] dark:text-gray-400">
                <li>
                  <a
                    className="hover:text-[#135bec] dark:hover:text-blue-400"
                    href="#"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-[#135bec] dark:hover:text-blue-400"
                    href="#"
                  >
                    Study Guide
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-[#135bec] dark:hover:text-blue-400"
                    href="#"
                  >
                    Community
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 dark:text-white">Company</h4>
              <ul className="space-y-3 text-sm text-[#4c669a] dark:text-gray-400">
                <li>
                  <a
                    className="hover:text-[#135bec] dark:hover:text-blue-400"
                    href="#"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-[#135bec] dark:hover:text-blue-400"
                    href="#"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-[#135bec] dark:hover:text-blue-400"
                    href="#"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200/60 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2024 StudyPilot Inc. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
              <a
                className="hover:text-[#135bec] dark:hover:text-blue-400"
                href="#"
              >
                Terms of Service
              </a>
              <a
                className="hover:text-[#135bec] dark:hover:text-blue-400"
                href="#"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
