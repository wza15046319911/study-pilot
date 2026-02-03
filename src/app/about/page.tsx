import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Footer } from "@/components/layout/Footer";
import { Spotlight } from "@/components/aceternity/spotlight";
import {
  Code,
  Lightbulb,
  Rocket,
  Heart,
  Target,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { getHeaderUser } from "@/lib/auth/getHeaderUser";

export default async function AboutPage() {
  const headerUser = await getHeaderUser();

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50 dark:bg-black">
      {/* <AmbientBackground /> */}
      <Header showNav={true} user={headerUser} />

      <main className="flex-grow w-full">
        {/* Hero Section */}
        <section className="relative h-[40vh] min-h-[400px] w-full flex items-center justify-center overflow-hidden bg-white dark:bg-black">
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-600 dark:from-neutral-50 dark:to-neutral-400 mb-6">
              About StudyPilot
            </h1>
            <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
              Building the intelligent study companion I wish I had.
            </p>
          </div>
        </section>

        {/* Developer Section */}
        <section className="py-20 px-4 md:px-8 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  <Code className="size-6" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Meet the Developer
                </h2>
              </div>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                Hi, I'm the creator behind StudyPilot. As a student at the
                University of Queensland, I've experienced firsthand the
                challenges of exam preparation—scouring through scattered PDF
                files, struggling to find answers, and managing the stress of
                finals week.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                I built StudyPilot not just as a project, but as a solution to a
                problem we all face. My goal is to use technology to transform
                how we study, making it more efficient, data-driven, and maybe
                even a little enjoyable.
              </p>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl">
                {/* Placeholder for Developer Image - using one of the avatars or a placeholder */}
                <Image
                  src="/avatar1.jpg" // Using a generic avatar for now as requested by "use available assets" logic
                  alt="Developer"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Inspiration Section */}
        <section className="py-20 bg-white dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400 mb-8">
              <Lightbulb className="size-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-8">
              The Spark of Inspiration
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-12">
              It started with a simple frustration: <span className="font-semibold text-slate-900 dark:text-white">Static PDF past papers just aren't enough.</span>
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <span className="text-red-500">❌</span> The Old Way
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Endlessly scrolling through PDFs, guessing answers, and having no way to track what you've actually mastered.
                </p>
              </div>
              <div className="flex items-center justify-center md:rotate-0 rotate-90">
                <Rocket className="size-8 text-blue-500 animate-pulse" />
              </div>
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <span className="text-green-500">✅</span> The StudyPilot Way
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Interactive question banks, instant feedback, and smart analytics that tell you exactly what to focus on.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Vision/Values Section */}
        <section className="py-20 px-4 md:px-8 max-w-6xl mx-auto">
           <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Our Core Values</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                What drives every feature we build.
              </p>
           </div>

           <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                 <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                    <Target className="size-6" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Mastery First</h3>
                 <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    We believe in quality over quantity. Our spaced repetition system ensures you don't just memorize, but truly master the concepts.
                 </p>
              </div>

              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                 <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 mb-6">
                    <Users className="size-6" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Student Centric</h3>
                 <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Every feature is built with direct feedback from students. We solve real study challenges, not hypothetical ones.
                 </p>
              </div>

              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                 <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
                    <Heart className="size-6" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Accessible Education</h3>
                 <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    High-quality exam preparation should be available to everyone. We're committed to keeping our core resources accessible.
                 </p>
              </div>
           </div>
        </section>

        {/* Footer CTA */}
        <section className="py-20 bg-slate-50 dark:bg-black text-center">
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Ready to upgrade your study routine?
           </h2>
           <div className="flex justify-center gap-4">
              <a href="/login" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-colors">
                 Start Practicing
              </a>
              <a href="/contact" className="px-8 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-bold rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                 Contact Me
              </a>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
