export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-[#0d121b]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-800 dark:border-t-blue-500" />
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Loading practice session...
        </p>
      </div>
    </div>
  );
}
