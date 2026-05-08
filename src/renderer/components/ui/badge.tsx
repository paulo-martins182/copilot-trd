import type { HTMLAttributes } from "react";
import { cn } from "@renderer/lib/cn";

type Tone = "neutral" | "success" | "warning" | "danger" | "accent";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
        tone === "neutral" && "border-border bg-white/[0.04] text-zinc-300",
        tone === "success" && "border-success/30 bg-success/10 text-emerald-300",
        tone === "warning" && "border-warning/30 bg-warning/10 text-amber-300",
        tone === "danger" && "border-danger/30 bg-danger/10 text-red-300",
        tone === "accent" && "border-accent/30 bg-accent/10 text-sky-300",
        className
      )}
      {...props}
    />
  );
}
