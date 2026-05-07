import type { SelectHTMLAttributes } from "react";
import { cn } from "@renderer/lib/cn";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-xl border border-border bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20",
        className
      )}
      {...props}
    />
  );
}
