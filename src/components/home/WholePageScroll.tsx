"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SplashScreen } from "./SplashScreen";
import { ImpactStats } from "./ImpactStats";
import {
  Database,
  BookOpen,
  Activity,
  GraduationCap,
} from "lucide-react";
import { FAQSection } from "@/components/common/FAQSection";
import { AnimatedTestimonials } from "@/components/aceternity/animated-testimonials";
import { FlipWords } from "@/components/aceternity/flip-words";
import { StatefulButton } from "@/components/ui/stateful-button";
import { FeaturesSection, FeatureItem, FeatureSkeleton } from "./FeaturesSection";

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
  faqs: { question: string; answer: string }[];
}

const testimonials = [
  {
    quote:
      "The explanations are incredibly clear. It's like having a private tutor available 24/7.",
    name: "Sarah Lin",
    designation: "Computer Science Student",
    src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=3388&auto=format&fit=crop",
  },
  {
    quote:
      "I passed my professional certification thanks to the extensive question bank and the immersive mock exams.",
    name: "James Wong",
    designation: "Financial Analyst",
    src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop",
  },
  {
    quote:
      "The spaced repetition system actually works. I've retained far more information than using traditional methods.",
    name: "Elena Rodriguez",
    designation: "Medical Student",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=3387&auto=format&fit=crop",
  },
  {
    quote:
      "The interface is so clean and distraction-free. StudyPilot has transformed my late-night study sessions.",
    name: "David Kim",
    designation: "Law Student",
    src: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=3560&auto=format&fit=crop",
  },
  {
    quote:
      "Tracking my progress with the analytics dashboard motivated me to study everyday. Seeing my accuracy grow is so satisfying.",
    name: "Maya Singh",
    designation: "Engineering Student",
    src: "https://images.unsplash.com/photo-1628157588553-5eeea00af15c?q=80&w=3560&auto=format&fit=crop",
  },
  {
    quote:
      "The 'Smart Review' feature saved me hours. It identified exactly where my knowledge gaps were.",
    name: "Thomas Chen",
    designation: "Graduate Researcher",
    src: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=3387&auto=format&fit=crop",
  },
];

export function WholePageScroll({
  user,
  isAdmin,
  subjects,
  content,
  faqs,
}: WholePageScrollProps) {
  const router = useRouter();

  const featureItems: FeatureItem[] = [
    {
      title: "Question Bank",
      description: "Access 10,000+ real exam questions, meticulously categorized by topic and difficulty. Always updated to match the latest university curriculum.",
      header: (
        <FeatureSkeleton className="flex items-center justify-center bg-blue-50 dark:bg-blue-900/20">
          <Database className="h-20 w-20 text-blue-500" />
        </FeatureSkeleton>
      ),
      icon: <Database className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: "Practice Mode",
      description: "Clean, distraction-free interface to focus on what matters — mastering each question with instant feedback.",
      header: (
        <FeatureSkeleton className="flex items-center justify-center bg-blue-50 dark:bg-blue-900/20">
          <BookOpen className="h-20 w-20 text-blue-500" />
        </FeatureSkeleton>
      ),
      icon: <BookOpen className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: "Smart Review",
      description: "AI-powered mistake tracking helps you focus on areas that need improvement.",
      header: (
        <FeatureSkeleton className="flex items-center justify-center bg-purple-50 dark:bg-purple-900/20">
          <Activity className="h-20 w-20 text-purple-500" />
        </FeatureSkeleton>
      ),
      icon: <Activity className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: "Mock Exam",
      description: "Simulate real exam conditions with timed practice sessions. Experience the pressure before the real day.",
      header: (
        <FeatureSkeleton className="flex items-center justify-center bg-purple-50 dark:bg-purple-900/20">
          <GraduationCap className="h-20 w-20 text-purple-500" />
        </FeatureSkeleton>
      ),
      icon: <GraduationCap className="h-4 w-4 text-neutral-500" />,
    },
  ];

  const handleStartPractice = async () => {
    // Simulate async operation if needed, or just navigation delay
    await new Promise(resolve => setTimeout(resolve, 500));
    router.push(user ? "/library" : "/login");
  };

  return (
    <>
      <div className="min-h-screen bg-background relative">
        {/* HERO / SPLASH SECTION */}
        <SplashScreen user={user} />

        {/* Impact Stats Section */}
        <ImpactStats />

        {/* Feature Section (Bento Grid) */}
        <FeaturesSection 
          title={content.features.title}
          subtitle={content.features.subtitle}
          overline={content.features.coreFeatures}
          features={featureItems}
        />

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
        <FAQSection items={faqs} className="bg-background" />

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
        <footer className="py-16 bg-card border-t border-border">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              <div className="col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <Image
                    src="/study-pilot-icon.png"
                    alt="StudyPilot"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                  <span className="font-bold text-xl text-foreground">
                    StudyPilot
                  </span>
                </div>
                <p className="text-muted-foreground max-w-sm">
                  The AI-powered study companion that helps you master any
                  subject faster with personalized learning paths.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-4">Product</h4>
                <ul className="space-y-3 text-sm text-gray-500">
                  <li>
                    <Link href="/library" className="hover:text-primary">
                      Library
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="hover:text-primary">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="hover:text-primary">
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="hover:text-primary">
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Company</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>
                    <Link href="/about" className="hover:text-primary">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-primary">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-sm text-muted-foreground">
                © 2026 StudyPilot Inc. All rights reserved.
              </div>
              <div className="flex gap-6 text-sm text-muted-foreground">
                <Link href="/terms" className="hover:text-primary">
                  Terms
                </Link>
                <Link href="/privacy" className="hover:text-primary">
                  Privacy
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
