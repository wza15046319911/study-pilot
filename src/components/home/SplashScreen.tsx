"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { TypewriterEffect } from "@/components/aceternity/typewriter-effect";
import ShimmerButton from "@/components/aceternity/shimmer-button";
import { SparklesCore } from "@/components/aceternity/sparkles";
import { Spotlight } from "@/components/aceternity/spotlight";

interface SplashScreenProps {
  user: any; // Add user prop to check auth status
}

export function SplashScreen({ user }: SplashScreenProps) {
  const router = useRouter();

  const handleStart = () => {
    if (user) {
      router.push("/library");
    } else {
      router.push("/login");
    }
  };

  const words = [
    {
      text: "StudyPilot",
      className: "text-blue-500 dark:text-blue-500",
    },
    {
      text: ".",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];

  return (
    <div className="relative w-full h-[100vh] bg-black/[0.96] antialiased bg-grid-white/[0.02] overflow-hidden">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      <div className="relative flex flex-col items-center justify-center h-full gap-6 z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center relative z-20"
        >
          <TypewriterEffect words={words} className="mb-6 text-[128px]" />

          <p className="mt-4 text-neutral-600 dark:text-neutral-300 text-lg max-w-md mx-auto leading-relaxed font-medium relative z-20">
            Your all-in-one platform to master any subject without the chaos.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 relative z-20"
        >
          <ShimmerButton
            className="shadow-2xl"
            onClick={handleStart}
            background="linear-gradient(110deg, #000103 45%, #1e2631 55%, #000103)"
          >
            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
              {user ? "Go to Library" : "Get Started Now"}
            </span>
          </ShimmerButton>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-500 dark:text-neutral-400"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-[1px] h-8 bg-neutral-300 dark:bg-neutral-700"></div>
        </motion.div>
      </div>
    </div>
  );
}
