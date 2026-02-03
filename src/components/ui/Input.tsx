"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef, useEffect, useId, useState } from "react";
import { AlertCircle } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, error, helperText, id, ...props }, ref) => {
    const generatedId = useId();
    const [inputId, setInputId] = useState<string | undefined>(id);

    useEffect(() => {
      if (!id) {
        setInputId(generatedId);
      } else {
        setInputId(id);
      }
    }, [id, generatedId]);

    const errorId = inputId ? `${inputId}-error` : undefined;
    const helperId = inputId ? `${inputId}-helper` : undefined;

    return (
      <div className="w-full space-y-1.5">
        <div className="relative group">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              "glass-input w-full rounded-lg h-12 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-normal transition-all",
              "focus:outline-none focus:ring-2 focus:ring-offset-0",
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400",
              icon ? "pl-11 pr-4" : "px-4",
              className
            )}
            {...props}
          />
          {error && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <AlertCircle className="size-5 text-red-500" />
            </div>
          )}
        </div>
        {error ? (
          <p id={errorId} className="text-sm text-red-500 flex items-center gap-1">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-sm text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
