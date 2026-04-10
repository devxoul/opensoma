'use client'

import { createContext, use, type ButtonHTMLAttributes, type ReactNode } from 'react'

import { cn } from '@/lib/cn'

interface ToggleGroupProps {
  children: ReactNode
  value: string
  onValueChange: (value: string) => void
  className?: string
}

const ToggleGroupContext = createContext<Omit<ToggleGroupProps, 'children' | 'className'> | null>(null)

function useToggleGroupContext() {
  const ctx = use(ToggleGroupContext)
  if (!ctx) throw new Error('ToggleGroupItem must be used within ToggleGroup')
  return ctx
}

export function ToggleGroup({ children, className, ...props }: ToggleGroupProps) {
  return (
    <ToggleGroupContext value={props}>
      <div className={cn('inline-flex items-center rounded-lg border border-border', className)}>{children}</div>
    </ToggleGroupContext>
  )
}

interface ToggleGroupItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  value: string
  children: ReactNode
}

export function ToggleGroupItem({ children, className, value, ...props }: ToggleGroupItemProps) {
  const ctx = useToggleGroupContext()
  const selected = ctx.value === value

  return (
    <button
      className={cn(
        'px-4 py-2 text-sm transition-colors [&:not(:first-child)]:border-l [&:not(:first-child)]:border-border',
        selected ? 'font-semibold text-foreground' : 'text-foreground-muted hover:text-foreground',
        className,
      )}
      type="button"
      onClick={() => ctx.onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  )
}
