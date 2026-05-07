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
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-white text-black hover:bg-zinc-200",
        variant === "secondary" && "border border-border bg-white/5 text-zinc-100 hover:bg-white/10",
        variant === "ghost" && "text-muted hover:bg-white/8 hover:text-white",
        variant === "danger" && "bg-danger/15 text-red-200 ring-1 ring-danger/30 hover:bg-danger/25",
        className
      )}
      {...props}
    />
  );
}
