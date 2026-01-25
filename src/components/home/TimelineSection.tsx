"use client";
import React from "react";
import { Timeline } from "@/components/aceternity/timeline";
import { FileText, Globe, Database, Layers, Rocket } from "lucide-react";

export function TimelineSection() {
  const data = [
    {
      title: "2018",
      content: (
        <div>
          <h4 className="text-xl md:text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
            The Beginning
          </h4>
          <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base mb-8">
            First edition launched with ~100 questions in Word documents.
          </p>
          <div className="flex items-center gap-2 text-blue-500">
            <FileText className="w-5 h-5" />
            <span className="font-medium text-sm">Word Docs Era</span>
          </div>
        </div>
      ),
    },
    {
      title: "2019",
      content: (
        <div>
          <h4 className="text-xl md:text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
            Going Online
          </h4>
          <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base mb-8">
            Second edition migrated to online docs with ~200 questions.
          </p>
          <div className="flex items-center gap-2 text-purple-500">
            <Globe className="w-5 h-5" />
            <span className="font-medium text-sm">Cloud Transition</span>
          </div>
        </div>
      ),
    },
    {
      title: "2021",
      content: (
        <div>
          <h4 className="text-xl md:text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
            Expansion
          </h4>
          <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base mb-8">
            Third edition released, growing to ~300 curated questions.
          </p>
          <div className="flex items-center gap-2 text-green-500">
            <Database className="w-5 h-5" />
            <span className="font-medium text-sm">Curated Content</span>
          </div>
        </div>
      ),
    },
    {
      title: "2025",
      content: (
        <div>
          <h4 className="text-xl md:text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
            Multi-Subject
          </h4>
          <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base mb-8">
            Fourth edition expanding to 2 subjects with ~400 questions.
          </p>
          <div className="flex items-center gap-2 text-orange-500">
            <Layers className="w-5 h-5" />
            <span className="font-medium text-sm">Subject Growth</span>
          </div>
        </div>
      ),
    },
    {
      title: "2026",
      content: (
        <div>
          <h4 className="text-xl md:text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
            Present Day
          </h4>
          <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base mb-8">
            Now covering 3 subjects with ~500 questions and smart analytics.
          </p>
          <div className="flex items-center gap-2 text-red-500">
            <Rocket className="w-5 h-5" />
            <span className="font-medium text-sm">Smart Platform</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="bg-white dark:bg-neutral-950">
      <div className="w-full max-w-7xl mx-auto pt-20 px-4 md:px-8 lg:px-10">
          <h2 className="text-base text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase mb-2">
            History
          </h2>
          <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100 max-w-4xl">
            Our Journey
          </h2>
          <p className="mt-4 text-neutral-700 dark:text-neutral-300 text-lg max-w-2xl">
            From humble beginnings in Word documents to a comprehensive AI-powered learning platform.
          </p>
      </div>
      
      {/* 
        We use a wrapper to override the internal title/description of the Timeline component
        since we provided our own header above 
      */}
      <div className="-mt-20">
        <Timeline data={data} />
      </div>
    </section>
  );
}
