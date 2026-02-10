import { Header } from "@/components/layout/Header";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { FAQJsonLd } from "@/components/seo/JsonLd";
import { FAQSection } from "@/components/common/FAQSection";
import { getHeaderUser } from "@/lib/auth/getHeaderUser";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("faq.meta");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function FAQPage() {
  const t = await getTranslations("faq.page");
  const faqJson = await getTranslations("faq.jsonLd");
  const faqs = faqJson.raw("items") as Array<{ question: string; answer: string }>;
  const headerUser = await getHeaderUser();

  return (
    <>
      <FAQJsonLd faqs={faqs} />

      <div className="relative min-h-screen flex flex-col bg-white dark:bg-slate-950">
        <Header showNav={true} user={headerUser} />

        <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="max-w-3xl mx-auto">
            {/* Main Content */}
            <article>
              {/* Header */}
              <header className="mb-12 text-center">
                <p className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-4">
                  {t("support")}
                </p>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                  {t("title")}
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
                  {t("subtitle")}{" "}
                  <Link
                    href="/contact"
                    className="text-blue-600 hover:underline"
                  >
                    {t("contactUs")}
                  </Link>
                </p>
              </header>

              <FAQSection showTitle={false} className="py-0" />
            </article>
          </div>
        </main>

        <BlogFooter />
      </div>
    </>
  );
}
