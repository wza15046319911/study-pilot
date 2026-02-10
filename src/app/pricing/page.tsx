import { Header } from "@/components/layout/Header";
import { PricingContent } from "./PricingContent";
import { getHeaderUser } from "@/lib/auth/getHeaderUser";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("marketingMeta.pricing");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function PricingPage() {
  const headerUser = await getHeaderUser();

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50 dark:bg-slate-950">
      <Header showNav={true} user={headerUser} />
      <PricingContent />
    </div>
  );
}
