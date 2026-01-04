import { LockOpen } from "lucide-react";
import UnlockManagerClient from "./UnlockManagerClient";

export default function AdminUnlocksPage() {
  return (
    <main className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <LockOpen className="size-8 text-green-500" />
          Manual Unlock Management
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Search for users and manage their bank access
        </p>
      </div>

      <UnlockManagerClient />
    </main>
  );
}
