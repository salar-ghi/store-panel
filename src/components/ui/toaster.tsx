
import * as React from "react"
import { useToast } from "@/hooks/use-toast"
import { persianNotification } from "@/lib/notification-message"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div dir="rtl" className="grid gap-1">
              {title && <ToastTitle>{typeof title === "string" ? persianNotification(title, props.variant === "destructive" ? undefined : "اطلاع‌رسانی") : title}</ToastTitle>}
              {description && (
                <ToastDescription>{typeof description === "string" ? persianNotification(description, "") : description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
