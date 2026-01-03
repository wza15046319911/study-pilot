import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Header } from "@/components/layout/Header";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/types/database";

export default async function PrivacyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userData = null;
  let isAdmin = false;

  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    const profile = profileData as Profile | null;
    userData = {
      username: profile?.username || user.email?.split("@")[0] || "User",
      avatar_url: profile?.avatar_url || undefined,
    };
    isAdmin =
      !!process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL;
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <AmbientBackground />
      <Header showNav={true} user={userData} isAdmin={isAdmin} />
      <main className="flex-grow w-full pt-20 pb-20 px-4">
        <GlassPanel className="max-w-4xl mx-auto p-8 md:p-12">
          <h1 className="text-3xl font-bold mb-8 dark:text-white">
            Privacy Policy
          </h1>
          <div className="prose dark:prose-invert max-w-none space-y-6 text-slate-500 dark:text-gray-400">
            <p>Last updated: January 1, 2026</p>
            <p>
              This Privacy Policy describes Our policies and procedures on the
              collection, use and disclosure of Your information when You use
              the Service and tells You about Your privacy rights and how the
              law protects You.
            </p>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8">
              Interpretation and Definitions
            </h2>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-4">
              Interpretation
            </h3>
            <p>
              The words of which the initial letter is capitalized have meanings
              defined under the following conditions. The following definitions
              shall have the same meaning regardless of whether they appear in
              singular or in plural.
            </p>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8">
              Collecting and Using Your Personal Data
            </h2>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-4">
              Types of Data Collected
            </h3>
            <h4 className="text-md font-medium text-slate-900 dark:text-white mt-2">
              Personal Data
            </h4>
            <p>
              While using Our Service, We may ask You to provide Us with certain
              personally identifiable information that can be used to contact or
              identify You. Personally identifiable information may include, but
              is not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email address</li>
              <li>First name and last name</li>
              <li>Usage Data</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-4">
              Usage Data
            </h3>
            <p>Usage Data is collected automatically when using the Service.</p>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8">
              Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, You can
              contact us:
            </p>
            <ul className="list-disc pl-6">
              <li>By visiting this page on our website: /contact</li>
            </ul>
          </div>
        </GlassPanel>
      </main>
    </div>
  );
}
