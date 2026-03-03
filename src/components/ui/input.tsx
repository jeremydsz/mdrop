import * as React from "react"

import { cn } from "@/lib/utils"
import { fieldControlClass } from "@/components/ui/field-styles"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        fieldControlClass,
        "h-9 w-full min-w-0 px-3 py-1 text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
