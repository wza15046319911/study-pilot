"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { motion, useInView } from "framer-motion";
import { SplashScreen } from "./SplashScreen";
import { StatefulButton } from "@/components/ui/stateful-button";

const ImpactStats = dynamic(
  () => import("./ImpactStats").then((module) => module.ImpactStats),
  { ssr: false },
);

const AnimatedTestimonials = dynamic(
  () =>
    import("@/components/aceternity/animated-testimonials").then(
      (module) => module.AnimatedTestimonials,
    ),
  { ssr: false },
);

const FlipWords = dynamic(
  () =>
    import("@/components/aceternity/flip-words").then(
      (module) => module.FlipWords,
    ),
  { ssr: false },
);

const TimelineSection = dynamic(
  () =>
    import("./TimelineSection").then((module) => module.TimelineSection),
  { ssr: false },
);

const FeatureCarousel = dynamic(
  () =>
    import("./FeatureCarousel").then((module) => module.FeatureCarousel),
  { ssr: false },
);

const FAQSection = dynamic(
  () => import("@/components/common/FAQSection").then((module) => module.FAQSection),
  { ssr: false },
);

const Footer = dynamic(
  () => import("@/components/layout/Footer").then((module) => module.Footer),
  { ssr: false },
);

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

function LazyMount({
  children,
  placeholderHeight = "min-h-[40vh]",
}: {
  children: ReactNode;
  placeholderHeight?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(containerRef, {
    once: true,
    margin: "300px 0px",
  });

  return (
    <div ref={containerRef} className={placeholderHeight}>
      {isInView ? children : null}
    </div>
  );
}

export function WholePageScroll() {
  const router = useRouter();

  const handleStartPractice = () => {
    router.push("/library");
  };

  return (
    <>
      <div className="min-h-screen bg-background relative">
        {/* HERO / SPLASH SECTION */}
        <SplashScreen />

        {/* Impact Stats Section */}
        <LazyMount placeholderHeight="min-h-[30vh]">
          <ImpactStats />
        </LazyMount>

        {/* Timeline Section */}
        <LazyMount>
          <TimelineSection />
        </LazyMount>

        {/* Feature Carousel Section */}
        <LazyMount>
          <FeatureCarousel />
        </LazyMount>

        {/* Testimonials Section */}
        <LazyMount>
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
        </LazyMount>

        {/* FAQ Section */}
        <LazyMount placeholderHeight="min-h-[20vh]">
          <FAQSection className="bg-background" />
        </LazyMount>

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
                  Start Practice
                </StatefulButton>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <LazyMount placeholderHeight="min-h-[10vh]">
          <Footer />
        </LazyMount>
      </div>
    </>
  );
}
