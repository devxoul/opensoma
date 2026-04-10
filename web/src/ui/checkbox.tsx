'use client'

import { Check } from '@phosphor-icons/react'
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { cn } from '~/lib/cn'

interface CheckboxProps extends Omit<
  ComponentPropsWithoutRef<typeof BaseCheckbox.Root>,
  'children' | 'onCheckedChange'
> {
  children?: ReactNode
  onCheckedChange?: (checked: boolean) => void
  labelClassName?: string
}

export function Checkbox({ children, className, labelClassName, onCheckedChange, ...props }: CheckboxProps) {
  return (
    <label className={cn('flex cursor-pointer items-center gap-2 text-sm text-foreground', labelClassName)}>
      <BaseCheckbox.Root
        className={cn(
          'flex h-4 w-4 items-center justify-center rounded border border-border transition-colors',
          'data-[checked]:border-primary data-[checked]:bg-primary',
          'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
          className,
        )}
        onCheckedChange={(checked) => onCheckedChange?.(checked)}
        {...props}
      >
        <BaseCheckbox.Indicator className="text-primary-foreground">
          <Check size={10} weight="bold" />
        </BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
      {children ? <span>{children}</span> : null}
    </label>
  )
}


