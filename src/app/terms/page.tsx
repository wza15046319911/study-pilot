import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Header } from "@/components/layout/Header";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/types/database";

export default async function TermsPage() {
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
            Terms of Service
          </h1>
          <div className="prose dark:prose-invert max-w-none space-y-6 text-slate-500 dark:text-gray-400">
            <p>Last updated: January 1, 2026</p>
            <p>
              Please read these terms and conditions carefully before using Our
              Service.
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
              Acknowledgment
            </h2>
            <p>
              These are the Terms and Conditions governing the use of this
              Service and the agreement that operates between You and the
              Company. These Terms and Conditions set out the rights and
              obligations of all users regarding the use of the Service.
            </p>
            <p>
              Your access to and use of the Service is conditioned on Your
              acceptance of and compliance with these Terms and Conditions.
              These Terms and Conditions apply to all visitors, users and others
              who access or use the Service.
            </p>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8">
              Termination
            </h2>
            <p>
              We may terminate or suspend Your access immediately, without prior
              notice or liability, for any reason whatsoever, including without
              limitation if You breach these Terms and Conditions.
            </p>
            <p>
              Upon termination, Your right to use the Service will cease
              immediately.
            </p>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8">
              Contact Us
            </h2>
            <p>
              If you have any questions about these Terms and Conditions, You
              can contact us:
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
