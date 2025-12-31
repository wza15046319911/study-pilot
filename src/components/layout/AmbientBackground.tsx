"use client";

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div
        className="ambient-blob bg-blue-300 dark:bg-blue-900/50 w-[500px] h-[500px] absolute top-[-100px] left-[-100px]"
        style={{ animationDuration: "10s" }}
      />
      <div className="ambient-blob bg-purple-200 dark:bg-purple-900/40 w-[400px] h-[400px] absolute bottom-[-50px] right-[-50px]" />
      <div className="ambient-blob bg-cyan-200 dark:bg-cyan-900/30 w-[300px] h-[300px] absolute top-[40%] left-[30%] opacity-40" />
    </div>
  );
}
