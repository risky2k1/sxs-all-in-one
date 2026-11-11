import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/utils";

export function NativeSelect({
  className,
  ...props
}: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-base border-2 border-border bg-secondary-background px-3 text-sm font-base text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black",
        className,
      )}
      {...props}
    />
  );
}
