import { AnimatePresence, motion } from "framer-motion";
import type { AnalysisRecord } from "@shared/domain/entities/Analysis";
import { Badge } from "@renderer/components/ui/badge";
import { formatCurrency, formatExpiry, formatSignal } from "@renderer/lib/format";

export interface SignalToastItem {
  id: string;
  record: AnalysisRecord;
}

export function isHighProbabilitySignal(record: AnalysisRecord): boolean {
  return (
    record.decision.shouldAlert &&
    (record.decision.finalSignal === "BUY" || record.decision.finalSignal === "SELL") &&
    record.decision.providerMode === "REAL" &&
    record.decision.empiricalWinRate >= 80 &&
    record.decision.sampleSupport >= 5 &&
    record.ai.riskLevel === "LOW" &&
    !record.isStale
  );
}

export function SignalToastStack({ items }: { items: SignalToastItem[] }) {
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-[380px] flex-col gap-3">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            className="rounded-2xl border border-success/30 bg-[#101720]/95 p-4 shadow-glow backdrop-blur"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <Badge tone={item.record.decision.finalSignal === "BUY" ? "success" : "danger"}>
                {formatSignal(item.record.decision.finalSignal)}
              </Badge>
              <span className="text-xs text-muted">{item.record.decision.empiricalWinRate}% win est.</span>
            </div>
            <div className="text-sm font-semibold text-white">
              Momento forte · {formatExpiry(item.record.decision.finalExpiry)} · ate{" "}
              {formatCurrency(item.record.decision.suggestedStake)}
            </div>
            <div className="mt-1 text-xs text-zinc-300">{item.record.ai.reasoning}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
