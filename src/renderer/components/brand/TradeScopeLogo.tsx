import { cn } from "@renderer/lib/cn";

interface TradeScopeLogoProps {
  className?: string;
  compact?: boolean;
}

export function TradeScopeLogo({ className, compact = false }: TradeScopeLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 shadow-panel">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(167,139,250,0.24),transparent_60%)]" />
        <svg viewBox="0 0 64 64" className="relative h-8 w-8" fill="none" aria-hidden="true">
          <path d="M14 40C22 34 25 28 30 22C34 18 39 14 46 10" stroke="url(#logo-line)" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M20 48H47" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
          <circle cx="46" cy="10" r="5.5" fill="#22C55E" />
          <circle cx="30" cy="22" r="3.8" fill="#38BDF8" />
          <circle cx="20" cy="48" r="3.3" fill="#A78BFA" />
          <defs>
            <linearGradient id="logo-line" x1="14" y1="40" x2="46" y2="10" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38BDF8" />
              <stop offset="1" stopColor="#A78BFA" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {!compact ? (
        <div>
          <div className="text-sm font-semibold tracking-[0.24em] text-white">TRADESCOPE AI</div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Browser copilot</div>
        </div>
      ) : null}
    </div>
  );
}
