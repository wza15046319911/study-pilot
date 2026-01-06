"use client";

import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import {
  Users,
  Target,
  Zap,
  Globe,
  Brain,
  BarChart3,
  Layers,
} from "lucide-react";

export default function AboutPage() {
  const features = [
    {
      icon: <Brain className="size-6 text-blue-500" />,
      title: "Smart Learning",
      description:
        "Adaptive algorithms that identify your weak points and tailor practice sessions to help you improve faster.",
    },
    {
      icon: <Layers className="size-6 text-purple-500" />,
      title: "Diverse Modes",
      description:
        "From immersive deep work to quick flashcards and full mock exams, choose the study style that fits your need.",
    },
    {
      icon: <BarChart3 className="size-6 text-emerald-500" />,
      title: "Data-Driven",
      description:
        "Detailed analytics and progress tracking visualizes your growth and keeps you motivated to reach your goals.",
    },
    {
      icon: <Globe className="size-6 text-amber-500" />,
      title: "Accessible",
      description:
        "High-quality educational resources available anytime, anywhere, designed for the modern student.",
    },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <AmbientBackground />
      <Header showNav={true} />

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-32 fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-8">
            Empowering Your <br className="hidden md:block" />
            <span className="text-blue-600">Learning Journey</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-loose">
            StudyPilot is an intelligent learning companion designed to help
            students master subjects through structured practice, instant
            feedback, and comprehensive analytics.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-10 mb-40">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-10 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="bg-white dark:bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-loose">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Vision / Values Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Our Vision
            </h2>
            <div className="h-1 w-20 bg-blue-500 rounded-full" />
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
              We believe that effective learning isn't just about
              memorization—it's about understanding and application.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Our goal is to create a distraction-free, focused environment
              where students can test their knowledge, identify gaps, and build
              confidence before their actual exams. By combining traditional
              rigorous practice with modern technology, we make exam preparation
              more efficient and less stressful.
            </p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-3xl transform rotate-3 blur-xl" />
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                    <Target className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                      Focus on Mastery
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Quality over quantity. We prioritize deep understanding of
                      core concepts.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                    <Users className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                      Student Centric
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Built with direct feedback from students to solve real
                      study challenges.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                    <Zap className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                      Efficient Growth
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Maximize learning outcomes in minimum time through
                      targeted practice.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
