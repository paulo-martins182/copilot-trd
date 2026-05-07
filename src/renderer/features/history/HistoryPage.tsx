import { useEffect, useState } from "react";
import type { AnalysisRecord } from "@shared/domain/entities/Analysis";
import { Badge } from "@renderer/components/ui/badge";
import { Button } from "@renderer/components/ui/button";
import { Card } from "@renderer/components/ui/card";
import { formatDateTime, formatExpiry, formatSignal } from "@renderer/lib/format";

export function HistoryPage({ onOpenAnalysis }: { onOpenAnalysis: (id: string) => void }) {
  const [records, setRecords] = useState<AnalysisRecord[]>([]);

  useEffect(() => {
    void window.tradeScope.analysis.getHistory({ limit: 100 }).then(setRecords);
  }, []);

  return (
    <div className="h-full overflow-y-auto p-6">
      <Card className="overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted">
            <tr>
              <th className="p-3">Sinal</th>
              <th className="p-3">Expiração</th>
              <th className="p-3">Confiança</th>
              <th className="p-3">Latência</th>
              <th className="p-3">Criado em</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-b border-border/60">
                <td className="p-3"><Badge>{formatSignal(record.decision.finalSignal)}</Badge></td>
                <td className="p-3 text-zinc-300">{formatExpiry(record.decision.finalExpiry)}</td>
                <td className="p-3 text-zinc-300">{record.ai.confidence}%</td>
                <td className="p-3 text-zinc-300">{record.latencyMs}ms</td>
                <td className="p-3 text-muted">{formatDateTime(record.createdAt)}</td>
                <td className="p-3 text-right">
                  <Button variant="ghost" onClick={() => onOpenAnalysis(record.id)}>Detalhes</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {records.length === 0 ? <div className="p-8 text-center text-sm text-muted">Nenhuma análise salva ainda.</div> : null}
      </Card>
    </div>
  );
}
