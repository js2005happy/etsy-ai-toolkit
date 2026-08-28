import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-base text-white ring-offset-background transition-all duration-300 ease-out placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff8a52]/20 focus-visible:border-[#ff8a52] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
