'use client'

import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'panel' | 'card'
}

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, variant = 'panel', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          variant === 'panel' ? 'glass-panel' : 'glass-card',
          'rounded-2xl',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

GlassPanel.displayName = 'GlassPanel'
