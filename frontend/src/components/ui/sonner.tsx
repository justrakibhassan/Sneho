"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-950 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-3xl group-[.toaster]:p-4",
          description: "group-[.toast]:text-slate-500",
          actionButton:
            "group-[.toast]:bg-slate-900 group-[.toast]:text-slate-50",
          cancelButton:
            "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-500",
          success: "group-[.toaster]:text-emerald-600 group-[.toaster]:border-emerald-100 group-[.toaster]:bg-emerald-50/50",
          error: "group-[.toaster]:text-rose-600 group-[.toaster]:border-rose-100 group-[.toaster]:bg-rose-50/50",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
