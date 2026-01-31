import { Header } from "@/components/layout/Header";
import { PricingContent } from "./PricingContent";

export default async function PricingPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50 dark:bg-slate-950">
      <Header showNav={true} />
      <PricingContent />
    </div>
  );
}
