import { useEffect, useState } from "react";
import type { AnalysisRecord } from "@shared/domain/entities/Analysis";
import type { TradeJournalMetrics } from "@shared/domain/entities/TradeJournal";
import { AnalysisCard } from "@renderer/components/composition/AnalysisCard";
import { Button } from "@renderer/components/ui/button";
import { Stat } from "@renderer/components/ui/stat";

export function DashboardPage({ onOpenAnalysis }: { onOpenAnalysis: (id: string) => void }) {
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [metrics, setMetrics] = useState<TradeJournalMetrics | null>(null);

  useEffect(() => {
    void window.tradeScope.analysis.getHistory({ limit: 20 }).then(setHistory);
    void window.tradeScope.journal.metrics().then(setMetrics);
  }, []);

  const latest = history[0] ?? null;
  const alerts = history.filter((record) => record.decision.shouldAlert).length;

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="grid grid-cols-4 gap-4">
        <Stat label="Análises" value={String(history.length)} hint="Últimas 20" />
        <Stat label="Alertas" value={String(alerts)} hint="BUY/SELL aprovados" />
        <Stat label="Acerto journal" value={`${metrics?.winRate ?? 0}%`} hint={`${metrics?.totalTrades ?? 0} registros`} />
        <Stat label="Confiança média" value={`${metrics?.averageConfidence ?? 0}%`} hint="Histórico salvo" />
      </div>

      <div className="mt-6 grid grid-cols-[1fr_360px] gap-4">
        <AnalysisCard.Root>
          <AnalysisCard.Header title="Último sinal" description="Decisão final após regras locais." />
          <AnalysisCard.Signal record={latest} />
          <AnalysisCard.Confidence record={latest} />
          <AnalysisCard.Reasoning record={latest} />
          <AnalysisCard.Details record={latest} />
          <AnalysisCard.Actions>
            <Button disabled={!latest} onClick={() => latest && onOpenAnalysis(latest.id)}>
              Ver detalhes
            </Button>
          </AnalysisCard.Actions>
        </AnalysisCard.Root>

        <div className="rounded-2xl border border-border bg-panel/80 p-5">
          <div className="text-base font-semibold">Princípios do MVP</div>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li>Sem operação automática ou auto-click.</li>
            <li>Sinais atrasados são bloqueados ou rebaixados.</li>
            <li>Valor sugerido é limite de risco, não promessa de retorno.</li>
            <li>WAIT/AVOID são resultados esperados em contexto incerto.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
