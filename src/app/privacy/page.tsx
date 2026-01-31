import { Header } from "@/components/layout/Header";
import { BlogFooter } from "@/components/blog/BlogFooter";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | StudyPilot",
  description:
    "Learn how StudyPilot collects, uses, and protects your personal information.",
};

export default async function PrivacyPage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <Header />

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
                Privacy Policy
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Last updated: January 1, 2026
              </p>
            </header>

            {/* Content */}
            <div className="space-y-14">
              <section>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  This Privacy Policy describes Our policies and procedures on
                  the collection, use and disclosure of Your information when
                  You use the Service and tells You about Your privacy rights
                  and how the law protects You.
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
                  Collecting and Using Your Personal Data
                </h2>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Types of Data Collected
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  While using Our Service, We may ask You to provide Us with
                  certain personally identifiable information that can be used
                  to contact or identify You. Personally identifiable
                  information may include, but is not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                  <li>Email address</li>
                  <li>First name and last name</li>
                  <li>Usage Data</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Usage Data
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Usage Data is collected automatically when using the Service.
                  This may include information such as Your Device&apos;s
                  Internet Protocol address, browser type, browser version, the
                  pages of our Service that You visit, and other diagnostic
                  data.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  Contact Us
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy, You can
                  contact us:
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
                  <li>Collecting and Using Data</li>
                  <li>Types of Data Collected</li>
                  <li>Usage Data</li>
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
                      href="/terms"
                      className="hover:text-blue-600 transition-colors"
                    >
                      Terms of Service
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
