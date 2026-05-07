import type { ReactNode } from "react";
import type { TradeJournalEntry, TradeJournalMetrics } from "@shared/domain/entities/TradeJournal";
import { Badge } from "@renderer/components/ui/badge";
import { Card } from "@renderer/components/ui/card";
import { formatCurrency, formatDateTime, formatSignal } from "@renderer/lib/format";

function Root({ children }: { children: ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}

function Filters() {
  return (
    <Card className="p-4 text-sm text-muted">
      Filtros avançados ficam no roadmap. O MVP lista os registros mais recentes.
    </Card>
  );
}

function ResultBadge({ result }: { result: TradeJournalEntry["result"] }) {
  if (result === "WIN") return <Badge tone="success">win</Badge>;
  if (result === "LOSS") return <Badge tone="danger">loss</Badge>;
  return <Badge tone="warning">doji</Badge>;
}

function Table({ entries }: { entries: TradeJournalEntry[] }) {
  return (
    <Card className="overflow-hidden p-0">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border text-xs uppercase text-muted">
          <tr>
            <th className="p-3">Ativo</th>
            <th className="p-3">Entrada</th>
            <th className="p-3">Resultado</th>
            <th className="p-3">Valor</th>
            <th className="p-3">Horário</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-border/60">
              <td className="p-3 font-medium text-white">{entry.asset}</td>
              <td className="p-3 text-zinc-300">{formatSignal(entry.entryType)}</td>
              <td className="p-3"><ResultBadge result={entry.result} /></td>
              <td className="p-3 text-zinc-300">{formatCurrency(entry.stake)}</td>
              <td className="p-3 text-muted">{formatDateTime(entry.entryTime)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {entries.length === 0 ? <div className="p-6 text-center text-sm text-muted">Nenhum registro manual ainda.</div> : null}
    </Card>
  );
}

function Metrics({ metrics }: { metrics?: TradeJournalMetrics | null }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      <Card className="p-4">
        <div className="text-xs text-muted">Trades</div>
        <div className="mt-1 text-2xl font-semibold">{metrics?.totalTrades ?? 0}</div>
      </Card>
      <Card className="p-4">
        <div className="text-xs text-muted">Acerto</div>
        <div className="mt-1 text-2xl font-semibold">{metrics?.winRate ?? 0}%</div>
      </Card>
      <Card className="p-4">
        <div className="text-xs text-muted">Confiança média</div>
        <div className="mt-1 text-2xl font-semibold">{metrics?.averageConfidence ?? 0}%</div>
      </Card>
      <Card className="p-4">
        <div className="text-xs text-muted">Sinais evitados</div>
        <div className="mt-1 text-2xl font-semibold">{metrics?.avoidedSignals ?? 0}</div>
      </Card>
    </div>
  );
}

export const TradeJournal = {
  Root,
  Filters,
  Table,
  ResultBadge,
  Metrics
};
