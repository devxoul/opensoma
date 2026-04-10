'use client'

import { CaretDown, Check } from '@phosphor-icons/react'
import { Select as BaseSelect } from '@base-ui/react/select'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { cn } from '~/lib/cn'

interface SelectProps {
  children: ReactNode
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  name?: string
  required?: boolean
  disabled?: boolean
}

export function Select({ children, onValueChange, ...props }: SelectProps) {
  return (
    <BaseSelect.Root
      onValueChange={(value) => {
        if (value !== null) {
          onValueChange?.(value)
        }
      }}
      {...props}
    >
      {children}
    </BaseSelect.Root>
  )
}

interface SelectTriggerProps extends Omit<ComponentPropsWithoutRef<typeof BaseSelect.Trigger>, 'children'> {
  placeholder?: ReactNode
}

export function SelectTrigger({ className, placeholder, ...props }: SelectTriggerProps) {
  return (
    <BaseSelect.Trigger
      className={cn(
        'flex w-full items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm transition-colors',
        'focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none',
        'data-[placeholder]:text-foreground-muted',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'cursor-pointer',
        className,
      )}
      {...props}
    >
      <BaseSelect.Value placeholder={placeholder} />
      <BaseSelect.Icon className="ml-2 shrink-0 text-foreground-muted">
        <CaretDown size={12} />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
  )
}

interface SelectPopupProps extends Omit<ComponentPropsWithoutRef<typeof BaseSelect.Popup>, 'children'> {
  children: ReactNode
  positionerClassName?: string
  listClassName?: string
}

export function SelectPopup({ children, className, positionerClassName, listClassName, ...props }: SelectPopupProps) {
  return (
    <BaseSelect.Portal>
      <BaseSelect.Positioner className={positionerClassName} sideOffset={4}>
        <BaseSelect.Popup
          className={cn(
            'max-h-60 overflow-auto rounded-md bg-surface py-1 shadow-lg outline outline-border',
            className,
          )}
          {...props}
        >
          <BaseSelect.List className={cn('outline-none', listClassName)}>{children}</BaseSelect.List>
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  )
}

interface SelectItemProps extends Omit<ComponentPropsWithoutRef<typeof BaseSelect.Item>, 'children' | 'value'> {
  value: string
  children: ReactNode
}

export function SelectItem({ children, className, ...props }: SelectItemProps) {
  return (
    <BaseSelect.Item
      className={cn(
        'flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5 text-sm text-foreground transition-colors outline-none select-none',
        'data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground',
        'data-[selected]:bg-primary-light',
        'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
      <BaseSelect.ItemIndicator className="text-current">
        <Check size={12} />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  )
}

interface SelectGroupProps extends Omit<ComponentPropsWithoutRef<typeof BaseSelect.Group>, 'children'> {
  children: ReactNode
  label: ReactNode
}

export function SelectGroup({ children, label, ...props }: SelectGroupProps) {
  return (
    <BaseSelect.Group {...props}>
      <BaseSelect.GroupLabel className="px-3 py-1 text-xs font-medium text-foreground-muted">
        {label}
      </BaseSelect.GroupLabel>
      {children}
    </BaseSelect.Group>
  )
}


