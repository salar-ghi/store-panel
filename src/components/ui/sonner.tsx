import * as React from "react"
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      dir="rtl"
      position="bottom-left"
      closeButton
      duration={4000}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast pointer-events-auto group-[.toaster]:bg-card/95 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:rounded-xl group-[.toaster]:shadow-xl group-[.toaster]:px-4 group-[.toaster]:py-3 group-[.toaster]:gap-3",
          title: "group-[.toast]:text-[13px] group-[.toast]:font-semibold",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-xs",
          icon: "group-[.toast]:ms-0 group-[.toast]:me-1",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:text-xs group-[.toast]:rounded-md",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:text-xs group-[.toast]:rounded-md",
          closeButton:
            "group-[.toast]:!left-auto group-[.toast]:!right-1.5 group-[.toast]:!top-1.5 group-[.toast]:!translate-x-0 group-[.toast]:!translate-y-0 group-[.toast]:opacity-100 group-[.toast]:bg-muted group-[.toast]:text-foreground group-[.toast]:border-border group-[.toast]:hover:bg-destructive group-[.toast]:hover:text-destructive-foreground group-[.toast]:transition-colors",
          success: "group-[.toaster]:border-s-4 group-[.toaster]:border-s-[hsl(var(--success))]",
          error: "group-[.toaster]:border-s-4 group-[.toaster]:border-s-destructive",
          warning: "group-[.toaster]:border-s-4 group-[.toaster]:border-s-[hsl(var(--warning))]",
          info: "group-[.toaster]:border-s-4 group-[.toaster]:border-s-[hsl(var(--info))]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
