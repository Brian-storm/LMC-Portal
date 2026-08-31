"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function FormField({
  className,
  label,
  error,
  required,
  children,
  id,
}: {
  className?: string
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
  id?: string
}) {
  const generatedId = React.useId()
  const fieldId = id || generatedId

  return (
    <div
      data-slot="form-field"
      className={cn("flex flex-col gap-1.5", className)}
    >
      <label
        htmlFor={fieldId}
        className="text-xs font-semibold text-foreground"
      >
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<{ id?: string; "aria-invalid"?: boolean }>, {
            id: fieldId,
            "aria-invalid": !!error || undefined,
          })
        : children}
      {error && (
        <p
          data-slot="form-field-error"
          className="text-xs text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}

function Form({
  className,
  onSubmit,
  children,
  ...props
}: Omit<React.ComponentProps<"form">, "onSubmit"> & {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
}) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit?.(e)
  }

  return (
    <form
      data-slot="form"
      className={cn("flex flex-col gap-4", className)}
      onSubmit={handleSubmit}
      noValidate
      {...props}
    >
      {children}
    </form>
  )
}

export { Form, FormField }