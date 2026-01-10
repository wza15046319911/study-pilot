import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Header } from "@/components/layout/Header";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { getAllBlogPosts } from "@/lib/blog-content";
import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/types/database";
import Link from "next/link";
import { BentoGrid, BentoGridItem } from "@/components/aceternity/bento-grid";
import { cn } from "@/lib/utils";

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

          <BentoGrid className="max-w-7xl mx-auto">
            {posts.map((post, i) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className={cn(
                  "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none dark:bg-black dark:border-white/[0.2] bg-white border border-transparent justify-between flex flex-col space-y-4 p-4",
                  i === 0 || i === 3 ? "md:col-span-2" : ""
                )}
              >
                <BentoGridItem
                  title={post.title}
                  description={post.excerpt}
                  header={
                    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100 flex items-center justify-center overflow-hidden relative">
                       {/* Placeholder pattern */}
                       <svg
                        className="w-16 h-16 opacity-10 absolute"
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
                  }
                  icon={
                    <div className="flex items-center gap-2 mb-2">
                        <div className="size-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 border border-white dark:border-slate-700">
                            {post.author.avatar}
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                            {post.category}
                        </span>
                    </div>
                  }
                  className="h-full bg-transparent border-none shadow-none p-0"
                />
              </Link>
            ))}
          </BentoGrid>
        </div>
      </main>

      <BlogFooter />
    </div>
  );
}
