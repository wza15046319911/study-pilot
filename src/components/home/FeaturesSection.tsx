"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { BentoGrid, BentoGridItem } from "@/components/aceternity/bento-grid";

export interface FeatureItem {
  title: string;
  description: string;
  header: React.ReactNode;
  icon: React.ReactNode;
}

interface FeaturesSectionProps {
  title: string;
  subtitle: string;
  overline: string;
  features: FeatureItem[];
}

export function FeaturesSection({
  title,
  subtitle,
  overline,
  features,
}: FeaturesSectionProps) {
  return (
    <section className="py-24 bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
            {overline}
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            {title}
          </p>
          <p className="mt-4 max-w-2xl text-xl text-neutral-500 dark:text-neutral-400 mx-auto">
            {subtitle}
          </p>
        </div>
        <BentoGrid className="max-w-6xl mx-auto md:auto-rows-[20rem]">
          {features.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              header={item.header}
              className={i === 3 || i === 6 ? "md:col-span-3" : ""}
              icon={item.icon}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}

export const FeatureSkeleton = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
  <div className={cn("flex flex-1 w-full h-full min-h-[6rem] rounded-xl   dark:bg-dot-white/[0.2] bg-dot-black/[0.2] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]  border border-transparent dark:border-white/[0.2] bg-neutral-100 dark:bg-black", className)}>
      {children}
  </div>
);
