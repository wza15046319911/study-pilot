import { Header } from "@/components/layout/Header";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/types/database";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service | StudyPilot",
  description:
    "Read the terms and conditions for using StudyPilot exam practice platform.",
};

export default async function TermsPage() {
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

  return (
    <div className="relative min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <Header user={userData} />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid lg:grid-cols-[1fr_240px] gap-16">
          {/* Main Content */}
          <article className="max-w-2xl">
            {/* Header */}
            <header className="mb-12">
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-4">
                Legal
              </p>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                Terms of Service
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Last updated: January 1, 2026
              </p>
            </header>

            {/* Content */}
            <div className="space-y-14">
              <section>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Please read these terms and conditions carefully before using
                  Our Service. Your access to and use of the Service is
                  conditioned on Your acceptance of and compliance with these
                  Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  Interpretation and Definitions
                </h2>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Interpretation
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  The words of which the initial letter is capitalized have
                  meanings defined under the following conditions. The following
                  definitions shall have the same meaning regardless of whether
                  they appear in singular or in plural.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  Acknowledgment
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  These are the Terms and Conditions governing the use of this
                  Service and the agreement that operates between You and the
                  Company. These Terms and Conditions set out the rights and
                  obligations of all users regarding the use of the Service.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Your access to and use of the Service is conditioned on Your
                  acceptance of and compliance with these Terms and Conditions.
                  These Terms and Conditions apply to all visitors, users and
                  others who access or use the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  User Accounts
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  When You create an account with Us, You must provide Us
                  information that is accurate, complete, and current at all
                  times. Failure to do so constitutes a breach of the Terms.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  You are responsible for safeguarding the password that You use
                  to access the Service and for any activities or actions under
                  Your password.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  Termination
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  We may terminate or suspend Your access immediately, without
                  prior notice or liability, for any reason whatsoever,
                  including without limitation if You breach these Terms and
                  Conditions.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Upon termination, Your right to use the Service will cease
                  immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  Contact Us
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  If you have any questions about these Terms and Conditions,
                  You can contact us:
                </p>
                <ul className="list-disc list-inside text-slate-700 dark:text-slate-300">
                  <li>
                    By visiting our{" "}
                    <Link
                      href="/contact"
                      className="text-blue-600 hover:underline"
                    >
                      Contact page
                    </Link>
                  </li>
                </ul>
              </section>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                  On this page
                </h3>
                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                  <li>Interpretation and Definitions</li>
                  <li>Acknowledgment</li>
                  <li>User Accounts</li>
                  <li>Termination</li>
                  <li>Contact Us</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                  Related
                </h3>
                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                  <li>
                    <Link
                      href="/privacy"
                      className="hover:text-blue-600 transition-colors"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq"
                      className="hover:text-blue-600 transition-colors"
                    >
                      FAQ
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <BlogFooter />
    </div>
  );
}
