"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-xs border border-input bg-transparent outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none"
        >
          <path d="M1 5.5L3.5 8L9 2" />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

function CheckboxWithLabel({
  className,
  label,
  id,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  label: string
}) {
  const generatedId = React.useId()
  const checkboxId = id || generatedId

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Checkbox id={checkboxId} {...props} />
      <label
        htmlFor={checkboxId}
        className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
      >
        {label}
      </label>
    </div>
  )
}

export { Checkbox, CheckboxWithLabel }