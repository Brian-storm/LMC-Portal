"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastVariant = "default" | "success" | "warning" | "danger" | "info"

interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

interface ToastState {
  toasts: Toast[]
}

type ToastAction =
  | { type: "ADD"; toast: Toast }
  | { type: "DISMISS"; id: string }

const ToastContext = React.createContext<{
  addToast: (toast: Omit<Toast, "id">) => void
  dismissToast: (id: string) => void
} | null>(null)

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case "ADD":
      return { toasts: [action.toast, ...state.toasts] }
    case "DISMISS":
      return { toasts: state.toasts.filter((t) => t.id !== action.id) }
    default:
      return state
  }
}

const variantStyles: Record<ToastVariant, string> = {
  default: "border-border bg-card text-card-foreground",
  success: "border-success/40 bg-success/10 text-success",
  warning: "border-warning/40 bg-warning/10 text-warning",
  danger: "border-destructive/40 bg-destructive/10 text-destructive",
  info: "border-info/40 bg-info/10 text-info",
}

const variantIcons: Record<ToastVariant, string> = {
  default: "",
  success: "✓",
  warning: "⚠",
  danger: "✕",
  info: "ℹ",
}

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(toastReducer, { toasts: [] })
  const timers = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  )

  const dismissToast = React.useCallback((id: string) => {
    dispatch({ type: "DISMISS", id })
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const addToast = React.useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = crypto.randomUUID()
      dispatch({ type: "ADD", toast: { ...toast, id } })

      const duration = toast.duration ?? 5000
      if (duration > 0) {
        const timer = setTimeout(() => {
          dismissToast(id)
        }, duration)
        timers.current.set(id, timer)
      }
    },
    [dismissToast]
  )

  React.useEffect(() => {
    const currentTimers = timers.current
    return () => {
      currentTimers.forEach((timer) => clearTimeout(timer))
    }
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, dismissToast }}>
      {children}
      <ToastViewport toasts={state.toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[]
  onDismiss: (id: string) => void
}) {
  return (
    <div
      data-slot="toast-viewport"
      className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          data-slot="toast"
          data-variant={toast.variant || "default"}
          className={cn(
            "flex items-start gap-3 rounded-xs border p-3 shadow-lg animate-in fade-in slide-in-from-right-4",
            variantStyles[toast.variant || "default"]
          )}
        >
          {toast.variant && toast.variant !== "default" && (
            <span className="mt-0.5 text-sm font-bold leading-none">
              {variantIcons[toast.variant]}
            </span>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold">{toast.title}</p>
            {toast.description && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {toast.description}
              </p>
            )}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="shrink-0 rounded-xs p-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}

function toast(
  addToast: (toast: Omit<Toast, "id">) => void,
  title: string,
  options?: { description?: string; variant?: ToastVariant; duration?: number }
) {
  addToast({
    title,
    description: options?.description,
    variant: options?.variant || "default",
    duration: options?.duration,
  })
}

export { ToastProvider, useToast, toast }
export type { ToastVariant }