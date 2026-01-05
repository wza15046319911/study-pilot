"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { SplashScreen } from "./SplashScreen";
import { ImpactStats } from "./ImpactStats";
import {
  Database,
  BookOpen,
  Activity,
  Zap,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react";

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

const features = [
  {
    icon: <Database size={24} />,
    title: "Question Bank",
    description:
      "Access thousands of curated practice questions across multiple subjects.",
    color: "#2D60FF",
    bgColor: "#EEF2FF",
  },
  {
    icon: <BookOpen size={24} />,
    title: "Smart Review",
    description:
      "AI-powered mistake tracking helps you focus on areas that need improvement.",
    color: "#6C3FF5",
    bgColor: "#F3E8FF",
  },
  {
    icon: <Activity size={24} />,
    title: "Immersive Mode",
    description: "Distraction-free practice sessions with real-time feedback.",
    color: "#FF9B6B",
    bgColor: "#FFF7ED",
  },
  {
    icon: <Zap size={24} />,
    title: "Spaced Repetition",
    description:
      "Scientifically-proven flashcard system for long-term retention.",
    color: "#22C55E",
    bgColor: "#F0FDF4",
  },
  {
    icon: <GraduationCap size={24} />,
    title: "Mock Exam",
    description:
      "Simulate real exam conditions with timed practice sessions. Experience the pressure before the real day.",
    color: "#7C3AED",
    bgColor: "#F5F3FF",
  },
];

const testimonials = [
  {
    quote:
      "The AI Tutor's explanations are incredibly clear. It's like having a private tutor available 24/7.",
    name: "Sarah Lin",
    role: "Computer Science Student",
    avatar: "/placeholder-avatar-1.png",
  },
  {
    quote:
      "I passed my professional certification thanks to the extensive question bank and the immersive mock exams.",
    name: "James Wong",
    role: "Financial Analyst",
    avatar: "/placeholder-avatar-2.png",
  },
  {
    quote:
      "The spaced repetition system actually works. I've retained far more information than using traditional methods.",
    name: "Elena Rodriguez",
    role: "Medical Student",
    avatar: "/placeholder-avatar-3.png",
  },
  {
    quote:
      "The interface is so clean and distraction-free. StudyPilot has transformed my late-night study sessions.",
    name: "David Kim",
    role: "Law Student",
    avatar: "/placeholder-avatar-4.png",
  },
  {
    quote:
      "Tracking my progress with the analytics dashboard motivated me to study everyday. Seeing my accuracy grow is so satisfying.",
    name: "Maya Singh",
    role: "Engineering Student",
    avatar: "/placeholder-avatar-5.png",
  },
  {
    quote:
      "The 'Smart Review' feature saved me hours. It identified exactly where my knowledge gaps were.",
    name: "Thomas Chen",
    role: "Graduate Researcher",
    avatar: "/placeholder-avatar-6.png",
  },
  {
    quote:
      "Best investment for my exam prep. The question quality matches the actual exam standards perfectly.",
    name: "Michael Zhang",
    role: "Medical Resident",
    avatar: "/placeholder-avatar-7.png",
  },
  {
    quote:
      "I love the mobile experience. Being able to squeeze in a quick 10-minute quiz during my commute is a game changer.",
    name: "Sophie Gupta",
    role: "Business School Student",
    avatar: "/placeholder-avatar-8.png",
  },
  {
    quote:
      "StudyPilot isn't just a question bank; it's a complete ecosystem. Truly the future of personalized learning.",
    name: "Prof. Alan Richards",
    role: "Educator & Researcher",
    avatar: "/placeholder-avatar-9.png",
  },
];

export function WholePageScroll({
  user,
  isAdmin,
  subjects,
  content,
}: WholePageScrollProps) {
  const [currentFeature, setCurrentFeature] = useState(0);

  // Auto-rotate feature carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [currentFeature]);

  const nextFeature = () =>
    setCurrentFeature((prev) => (prev + 1) % features.length);
  const prevFeature = () =>
    setCurrentFeature((prev) => (prev - 1 + features.length) % features.length);

  return (
    <>
      <div className="min-h-screen bg-background relative">
        {/* HERO / SPLASH SECTION */}
        {/* HERO / SPLASH SECTION */}
        <SplashScreen user={user} />
        {/* Header is usually fixed, but here it seems assumed to be inside or handled differently? 
            Wait, WholePageScroll doesn't render Header directly? 
            Yes it does on line 7: import { Header } from "@/components/layout/Header";
            But I don't see <Header /> being used in the JSX?
            Ah, I must have missed it in previous view_file or it's not there? 
            Let me check the `view_file` output for `WholePageScroll.tsx` again.
        */}

        {/* Impact Stats Section */}
        <section className="pt-24">
          <ImpactStats />
        </section>

        {/* Feature Carousel Section */}
        <section className="py-24 bg-card">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">
                {content.features.coreFeatures}
              </p>
              <h2 className="text-4xl font-bold text-foreground tracking-tight">
                {content.features.title}
              </h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
                {content.features.subtitle}
              </p>
            </motion.div>

            {/* Carousel */}
            <div className="relative">
              {/* Navigation Buttons */}
              <button
                onClick={prevFeature}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 size-12 rounded-full bg-card shadow-lg flex items-center justify-center hover:bg-muted transition-colors border border-border"
              >
                <ChevronLeft size={24} className="text-muted-foreground" />
              </button>
              <button
                onClick={nextFeature}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 size-12 rounded-full bg-card shadow-lg flex items-center justify-center hover:bg-muted transition-colors border border-border"
              >
                <ChevronRight size={24} className="text-muted-foreground" />
              </button>

              {/* Carousel Content */}
              <div className="overflow-hidden rounded-3xl bg-card border border-border shadow-2xl shadow-blue-900/5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentFeature}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="grid md:grid-cols-2 gap-12 p-12 items-center"
                  >
                    {/* Feature Content */}
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div
                          className="size-10 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: features[currentFeature].bgColor,
                            color: features[currentFeature].color,
                          }}
                        >
                          {features[currentFeature].icon}
                        </div>
                        <span className="text-primary font-semibold tracking-wide text-sm uppercase">
                          Feature Spotlight
                        </span>
                      </div>

                      <h3 className="text-4xl font-bold text-foreground mb-4 leading-tight">
                        {features[currentFeature].title}
                      </h3>
                      <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                        {features[currentFeature].description}
                      </p>
                    </div>

                    {/* Feature Visual Placeholder */}
                    <div className="bg-muted rounded-2xl border border-border min-h-[350px] flex flex-col relative overflow-hidden group">
                      {features[currentFeature].title === "Mock Exam" ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#F5F3FF] p-8">
                          {/* Background Interface Image */}
                          <motion.div
                            className="absolute w-[85%] top-12 rounded-xl overflow-hidden shadow-xl border border-slate-200/60 dark:border-slate-700/60"
                            initial={{ y: 20, opacity: 0, rotateX: 10 }}
                            animate={{ y: 0, opacity: 1, rotateX: 0 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            style={{ perspective: 1000 }}
                          >
                            <Image
                              src="/mock-exam-interface.png"
                              alt="Mock Exam Interface"
                              width={800}
                              height={600}
                              className="w-full h-auto object-cover opacity-90"
                            />
                            {/* Overlay gradient to fade bottom */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#F5F3FF] via-transparent to-transparent" />
                          </motion.div>

                          {/* Foreground Entry Card */}
                          <motion.div
                            className="relative w-[65%] shadow-[0_20px_60px_-15px_rgba(124,58,237,0.4)] rounded-xl overflow-hidden z-10"
                            initial={{ scale: 0.8, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{
                              delay: 0.3,
                              type: "spring",
                              stiffness: 260,
                              damping: 20,
                            }}
                          >
                            <Image
                              src="/mock-exam-card.png"
                              alt="Start Mock Exam"
                              width={500}
                              height={400}
                              className="w-full h-auto object-cover"
                            />
                          </motion.div>
                        </div>
                      ) : (
                        <div className="p-8 flex flex-col h-full relative">
                          <div className="absolute top-4 left-4 flex gap-2">
                            <div className="size-3 rounded-full bg-red-400/20" />
                            <div className="size-3 rounded-full bg-yellow-400/20" />
                            <div className="size-3 rounded-full bg-green-400/20" />
                          </div>
                          <div className="mt-8 flex-1 bg-card rounded-xl shadow-sm border border-border/50 p-6 flex items-center justify-center relative overflow-hidden">
                            <motion.div
                              key={currentFeature}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 15,
                                delay: 0.1,
                              }}
                              className="size-24 rounded-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-500 relative z-10"
                              style={{
                                backgroundColor:
                                  features[currentFeature].bgColor,
                                color: features[currentFeature].color,
                              }}
                            >
                              {features[currentFeature].icon}
                            </motion.div>

                            {/* Decorative background circle */}
                            <div
                              className="absolute inset-0 opacity-20"
                              style={{
                                background: `radial-gradient(circle at center, ${features[currentFeature].color}, transparent 70%)`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Segmented Progress Indicators - Below Carousel */}
              <div className="flex justify-center mt-6">
                <div className="flex gap-2 w-full max-w-md items-center">
                  {features.map((_, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setCurrentFeature(index)}
                      className="h-1.5 bg-muted rounded-full overflow-hidden relative cursor-pointer transition-colors hover:bg-muted-foreground/20"
                      aria-label={`Go to feature ${index + 1}`}
                      animate={{
                        flex: index === currentFeature ? 3 : 1,
                      }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      {/* Active State (Animating) - Only current segment has primary color */}
                      {index === currentFeature && (
                        <motion.div
                          key={currentFeature}
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 4, ease: "linear" }}
                          className="absolute inset-0 bg-primary h-full"
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vertical Scrolling Testimonials Section */}
        <section className="py-24 bg-card relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 mb-12 text-center">
            <h2 className="text-5xl font-bold text-foreground tracking-tight mb-4">
              What our users say
            </h2>
            <p className="text-muted-foreground text-lg">
              See what our customers have to say about us.
            </p>
          </div>

          <div className="relative h-[800px] overflow-hidden">
            {/* Gradients to fade in/out */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-card to-transparent z-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-card to-transparent z-20 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
              {/* Column 1 - Slow speed */}
              <div className="flex flex-col gap-6 animate-scroll-y-slow">
                {[...testimonials, ...testimonials].map((t, i) => (
                  <TestimonialCard key={`col1-${i}`} data={t} />
                ))}
              </div>

              {/* Column 2 - Medium speed, reverse offset */}
              <div className="hidden md:flex flex-col gap-6 animate-scroll-y-medium mt-[-100px]">
                {[...testimonials, ...testimonials].map((t, i) => (
                  <TestimonialCard key={`col2-${i}`} data={t} />
                ))}
              </div>

              {/* Column 3 - Fast speed */}
              <div className="hidden md:flex flex-col gap-6 animate-scroll-y-fast">
                {[...testimonials, ...testimonials].map((t, i) => (
                  <TestimonialCard key={`col3-${i}`} data={t} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 bg-background text-foreground">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-8">
                Ready to Ace Your Exams?
              </h2>
              <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                Join thousands of students who are already studying smarter, not
                harder. Start your free trial today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={user ? "/library" : "/login"}
                  className="inline-flex h-14 px-8 items-center justify-center rounded-full bg-primary text-white font-bold text-lg hover:bg-blue-600 transition-all"
                >
                  {user ? "Start to Practice" : "Create Free Account"}
                </Link>
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

      {/* Global Styles for Scrolling Animation */}
      <style jsx global>{`
        @keyframes scroll-y {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        .animate-scroll-y-slow {
          animation: scroll-y 45s linear infinite;
        }
        .animate-scroll-y-medium {
          animation: scroll-y 35s linear infinite;
        }
        .animate-scroll-y-fast {
          animation: scroll-y 40s linear infinite;
        }
        .animate-scroll-y-slow:hover,
        .animate-scroll-y-medium:hover,
        .animate-scroll-y-fast:hover {
          animation-play-state: paused;
        }
      `}</style>
    </>
  );
}

function TestimonialCard({ data }: { data: any }) {
  return (
    <div className="p-8 bg-card border border-border rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow">
      <p className="text-muted-foreground mb-6 leading-relaxed">{data.quote}</p>
      <div className="flex items-center gap-4">
        <div className="size-10 rounded-full bg-muted overflow-hidden relative">
          <div className="absolute inset-0 flex items-center justify-center bg-primary/10 text-primary font-bold text-sm">
            {data.name.charAt(0)}
          </div>
        </div>
        <div>
          <h4 className="font-bold text-sm text-foreground">{data.name}</h4>
          <p className="text-xs text-muted-foreground">{data.role}</p>
        </div>
      </div>
    </div>
  );
}
