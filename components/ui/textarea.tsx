import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-input bg-white px-3 py-2 text-base ring-offset-background transition-all duration-300 ease-out placeholder:text-[#86868b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/20 focus-visible:border-[#0071e3] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
