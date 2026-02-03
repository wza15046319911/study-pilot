import { Header } from "@/components/layout/Header";
import { PricingContent } from "./PricingContent";
import { getHeaderUser } from "@/lib/auth/getHeaderUser";

export default async function PricingPage() {
  const headerUser = await getHeaderUser();

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50 dark:bg-slate-950">
      <Header showNav={true} user={headerUser} />
      <PricingContent />
    </div>
  );
}
