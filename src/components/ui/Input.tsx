"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative group">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "glass-input w-full rounded-lg h-12 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all text-sm font-normal",
            icon ? "pl-11 pr-4" : "px-4",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
