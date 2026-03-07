import type { ComponentPropsWithoutRef } from "react";
import { ExternalLink, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type VideoLinkButtonProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href: string;
  label?: string;
  variant?: "primary" | "secondary" | "quiet";
};

const variantClasses = {
  primary:
    "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 shadow-lg shadow-slate-900/10",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500/60 dark:hover:text-blue-300 dark:hover:bg-blue-500/10",
  quiet:
    "border border-slate-200/80 bg-white/80 text-slate-600 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-blue-500/60 dark:hover:text-blue-300 dark:hover:bg-blue-500/10",
};

export function VideoLinkButton({
  href,
  label = "Watch video",
  variant = "secondary",
  className,
  children,
  ...props
}: VideoLinkButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-[background-color,border-color,color,box-shadow]",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      <PlayCircle className="size-4 shrink-0" />
      <span>{label}</span>
      {children}
      <ExternalLink className="size-3.5 shrink-0 opacity-70" />
    </a>
  );
}
