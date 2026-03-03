import * as React from "react"

import { cn } from "@/lib/utils"
import { fieldControlClass } from "@/components/ui/field-styles"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        fieldControlClass,
        "w-full min-h-[120px] px-3 py-2 text-sm resize-none",
        className
      )}
      {...props}
    />
  )
})

Textarea.displayName = "Textarea"

export { Textarea }
