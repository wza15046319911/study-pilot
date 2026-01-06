import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Header } from "@/components/layout/Header";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { getAllBlogPosts } from "@/lib/blog-content";
import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/types/database";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Blog | StudyPilot",
  description:
    "Insights for students, by students. Engineering, Psychology, and Study tips.",
};

export default async function BlogIndexPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userData = null;
  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const profile = profileData as Profile | null;

    userData = {
      username: profile?.username || user.email?.split("@")[0] || "User",
      avatar_url: profile?.avatar_url ?? undefined,
      is_vip: profile?.is_vip || false,
    };
  } else {
    userData = { username: "Guest", is_vip: false };
  }

  const posts = getAllBlogPosts();
  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#f0f4fc] dark:bg-slate-950 overflow-x-hidden selection:bg-blue-500/30">
      <AmbientBackground />
      <Header user={userData} />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-6 py-20 relative z-10">
        <div className="flex flex-col gap-16">
          {/* Header */}
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
              StudyPilot <span className="text-blue-600">Blog</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Latest insights on study techniques, AI in education, and exam
              preparation strategies.
            </p>
          </div>

          {/* Featured Post */}
          {featuredPost && (
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="group relative grid md:grid-cols-2 gap-8 p-6 md:p-12 rounded-3xl bg-white dark:bg-slate-900/50 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                {/* Fallback pattern if no image */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-slate-300 dark:text-slate-600">
                  <svg
                    className="w-16 h-16 opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-6 text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  <span>{featuredPost.category}</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {featuredPost.date}
                  </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight group-hover:text-blue-600 transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 line-clamp-3 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-500 dark:text-slate-400 border border-white dark:border-slate-700 shadow-sm">
                    {featuredPost.author.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {featuredPost.author.name}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {featuredPost.author.role}
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                    Read Post <ArrowUpRight className="size-4" />
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Grid Layout */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {remainingPosts.map((post) => (
              <Link
                href={`/blog/${post.slug}`}
                key={post.slug}
                className="group flex flex-col p-8 rounded-3xl bg-white dark:bg-slate-900/50 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {post.date}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 leading-snug group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 line-clamp-3 leading-relaxed flex-grow">
                  {post.excerpt}
                </p>
                <div className="pt-6 mt-auto border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 border border-white dark:border-slate-700">
                    {post.author.avatar}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {post.author.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <BlogFooter />
    </div>
  );
}
