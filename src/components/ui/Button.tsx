'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none'

    const variants = {
      primary: 'bg-[#135bec] hover:bg-[#0e45b8] text-white shadow-lg shadow-blue-500/25',
      secondary: 'bg-white/50 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10 border border-[#e7ebf3] dark:border-gray-600 text-[#0d121b] dark:text-white',
      ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-[#0d121b] dark:text-white',
      outline: 'border border-[#135bec] text-[#135bec] hover:bg-[#135bec] hover:text-white'
    }

    const sizes = {
      sm: 'h-8 px-3 text-sm rounded-lg gap-1.5',
      md: 'h-11 px-5 text-sm rounded-lg gap-2',
      lg: 'h-12 px-6 text-base rounded-xl gap-2'
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
