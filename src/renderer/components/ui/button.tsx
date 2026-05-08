import type { ButtonHTMLAttributes } from "react";
import { cn } from "@renderer/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ className, variant = "secondary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        "shadow-sm hover:-translate-y-px",
        variant === "primary" &&
          "border border-accent/30 bg-gradient-to-r from-accent to-accentSoft text-slate-950 hover:brightness-110",
        variant === "secondary" &&
          "border border-border bg-white/[0.04] text-zinc-100 shadow-panel hover:border-accent/35 hover:bg-white/[0.08]",
        variant === "ghost" && "text-muted hover:bg-white/[0.06] hover:text-white",
        variant === "danger" && "border border-danger/30 bg-danger/15 text-red-200 hover:bg-danger/25",
        className
      )}
      {...props}
    />
  );
}
