import { motion, AnimatePresence } from "framer-motion";
import type { AnalysisRecord } from "@shared/domain/entities/Analysis";
import { Badge } from "@renderer/components/ui/badge";
import { Button } from "@renderer/components/ui/button";
import { formatCurrency, formatExpiry, formatSignal } from "@renderer/lib/format";

export function CopilotAlert({
  record,
  onDismiss
}: {
  record?: AnalysisRecord | null;
  onDismiss: () => void;
}) {
  const visible = Boolean(record?.decision.shouldAlert);
  return (
    <AnimatePresence>
      {visible && record ? (
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.98 }}
          className="fixed right-6 top-6 z-50 w-[420px] rounded-2xl border border-accent/30 bg-[#11141d]/95 p-5 shadow-glow backdrop-blur"
        >
          <div className="mb-3 flex items-center justify-between">
            <Badge tone={record.decision.finalSignal === "BUY" ? "success" : "danger"}>
              {formatSignal(record.decision.finalSignal)}
            </Badge>
            <Button variant="ghost" onClick={onDismiss}>
              Fechar
            </Button>
          </div>
          <div className="text-lg font-semibold text-white">
            Expiração {formatExpiry(record.decision.finalExpiry)} · até {formatCurrency(record.decision.suggestedStake)}
          </div>
          <p className="mt-2 text-sm text-zinc-300">{record.ai.reasoning}</p>
          <p className="mt-3 rounded-xl border border-warning/25 bg-warning/10 p-3 text-xs text-amber-200">
            {record.ai.warning}
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
