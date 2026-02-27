import { Suspense } from "react";
import DistributionManager from "./DistributionManager";
import { getDistributions } from "@/lib/actions/distribution";

export const metadata = {
  title: "Distribution Management | Admin",
};

export default async function DistributionPage() {
  const { distributions, total } = await getDistributions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#0d121b] dark:text-white">
          Distribution Management
        </h1>
        <p className="text-[#4c669a] dark:text-gray-400 mt-2">
          Manage access distribution for question banks and mock exams.
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <DistributionManager initialDistributions={distributions} />
      </Suspense>
    </div>
  );
}
