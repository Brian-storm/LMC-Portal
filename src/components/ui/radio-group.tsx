"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "peer size-4 shrink-0 rounded-full border border-input bg-transparent outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex items-center justify-center"
      >
        <div className="size-2 rounded-full bg-primary-foreground" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

function RadioGroupItemWithLabel({
  className,
  label,
  id,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item> & {
  label: string
}) {
  const generatedId = React.useId()
  const itemId = id || generatedId

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <RadioGroupItem id={itemId} {...props} />
      <label
        htmlFor={itemId}
        className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
      >
        {label}
      </label>
    </div>
  )
}

export { RadioGroup, RadioGroupItem, RadioGroupItemWithLabel }