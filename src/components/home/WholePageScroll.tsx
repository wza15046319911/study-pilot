"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SplashScreen } from "./SplashScreen";
import { ImpactStats } from "./ImpactStats";
import {} from // Database,
// BookOpen,
// Activity,
// GraduationCap,
"lucide-react";
import { FAQSection } from "@/components/common/FAQSection";
import { AnimatedTestimonials } from "@/components/aceternity/animated-testimonials";
import { FlipWords } from "@/components/aceternity/flip-words";
import { StatefulButton } from "@/components/ui/stateful-button";
import { TimelineSection } from "./TimelineSection";
import { FeatureCarousel } from "./FeatureCarousel";
import { Footer } from "@/components/layout/Footer";

// ... (Subject and Props interfaces same as before)
interface Subject {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  question_count?: number;
  is_new?: boolean;
  is_hot?: boolean;
}

interface WholePageScrollProps {
  user: any;
  isAdmin: boolean;
  subjects: Subject[];
  content: {
    hero: {
      title: string;
      subtitle: string;
      completed: string;
      tagList: string;
      tagFunction: string;
    };
    features: {
      title: string;
      subtitle: string;
      coreFeatures: string;
      bank: { title: string; description: string };
      mistakes: { title: string; description: string };
      flow: { title: string; description: string };
      flashcards: { title: string; description: string };
    };
    stats: {
      users: string;
      subjects: string;
      questions: string;
    };
    browse: {
      title: string;
      subtitle: string;
      viewAll: string;
    };
    results: {
      accuracy: string;
      accuracyDescription?: string;
    };
    analytics: {
      title: string;
      subtitle: string;
      features: {
        radar: string;
        history: string;
      };
    };
    common: {
      questions: string;
    };
  };
}

const testimonials = [
  {
    quote:
      "The explanations are incredibly clear. It's like having a private tutor available 24/7.",
    name: "Sarah Lin",
    designation: "CS Student",
    src: "/avatar1.jpg",
  },
  {
    quote:
      "The spaced repetition system actually works. I've retained far more information than using traditional methods.",
    name: "Elena Rodriguez",
    designation: "Engineering Student",
    src: "/avatar3.jpg",
  },
  {
    quote:
      "The interface is so clean and distraction-free. StudyPilot has transformed my late-night study sessions.",
    name: "David Kim",
    designation: "CS Student",
    src: "/avatar4.jpg",
  },
  {
    quote:
      "The 'Smart Review' feature saved me hours. It identified exactly where my knowledge gaps were.",
    name: "Thomas Chen",
    designation: "IT Student",
    src: "/avatar2.jpg",
  },
];

export function WholePageScroll({ user }: WholePageScrollProps) {
  const router = useRouter();

  const handleStartPractice = async () => {
    // Simulate async operation if needed, or just navigation delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push(user ? "/library" : "/login");
  };

  return (
    <>
      <div className="min-h-screen bg-background relative">
        {/* HERO / SPLASH SECTION */}
        <SplashScreen user={user} />

        {/* Impact Stats Section */}
        <ImpactStats />

        {/* Timeline Section */}
        <TimelineSection />

        {/* Feature Carousel Section */}
        <FeatureCarousel />

        {/* Testimonials Section */}
        <section className="py-24 bg-neutral-50 dark:bg-black relative flex flex-col items-center justify-center antialiased overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 mb-12 text-center relative z-10">
            <h2 className="text-5xl font-bold text-neutral-800 dark:text-white tracking-tight mb-4">
              What our users say
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-lg">
              See what our customers have to say about us.
            </p>
          </div>

          <div className="relative z-10 w-full overflow-hidden">
            <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection className="bg-background" />

        {/* CTA Section */}
        <section className="py-32 bg-background text-foreground relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-8 flex flex-col md:block items-center justify-center gap-2">
                <span>Ready to</span>
                <FlipWords words={["Ace", "Master", "Dominate"]} />
                <span>Your Exams?</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                Join thousands of students who are already studying smarter, not
                harder. Start your free trial today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <StatefulButton
                  onClick={handleStartPractice}
                  className="rounded-full bg-primary text-white font-bold text-lg px-8 py-4 h-14 min-w-[200px]"
                >
                  {user ? "Start to Practice" : "Create Free Account"}
                </StatefulButton>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
