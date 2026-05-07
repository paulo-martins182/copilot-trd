import type { PropsWithChildren, ReactNode } from "react";
import type { AnalysisRecord, Signal } from "@shared/domain/entities/Analysis";
import { Badge } from "@renderer/components/ui/badge";
import { Button } from "@renderer/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@renderer/components/ui/card";
import { cn } from "@renderer/lib/cn";
import { formatCurrency, formatExpiry, formatSignal } from "@renderer/lib/format";

function signalTone(signal: Signal) {
  if (signal === "BUY") return "success";
  if (signal === "SELL") return "danger";
  if (signal === "AVOID") return "warning";
  return "neutral";
}

function Root({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <Card className={cn("space-y-4", className)}>{children}</Card>;
}

function Header({ title = "Última análise", description }: { title?: string; description?: string }) {
  return (
    <CardHeader className="mb-0">
      <div>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </div>
    </CardHeader>
  );
}

function SignalView({ record }: { record?: AnalysisRecord | null }) {
  if (!record) return <Badge>Sem análise</Badge>;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge tone={signalTone(record.decision.finalSignal)}>{formatSignal(record.decision.finalSignal)}</Badge>
      <Badge tone="accent">{formatExpiry(record.decision.finalExpiry)}</Badge>
      {record.isStale ? <Badge tone="warning">Atrasado</Badge> : <Badge tone="success">Fresco</Badge>}
    </div>
  );
}

function Confidence({ record }: { record?: AnalysisRecord | null }) {
  const confidence = record?.ai.confidence ?? 0;
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs text-muted">
        <span>Confiança</span>
        <span>{confidence}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${confidence}%` }} />
      </div>
    </div>
  );
}

function Reasoning({ record }: { record?: AnalysisRecord | null }) {
  return (
    <div className="rounded-xl border border-border bg-black/20 p-3 text-sm text-zinc-300">
      {record?.ai.reasoning ?? "Aguardando captura e análise do gráfico."}
    </div>
  );
}

function Details({ record }: { record?: AnalysisRecord | null }) {
  if (!record) return null;
  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div className="rounded-xl bg-white/[0.03] p-3">
        <div className="text-xs text-muted">Risco</div>
        <div className="mt-1 font-medium">{record.ai.riskLevel}</div>
      </div>
      <div className="rounded-xl bg-white/[0.03] p-3">
        <div className="text-xs text-muted">Valor máximo</div>
        <div className="mt-1 font-medium">{formatCurrency(record.decision.suggestedStake)}</div>
      </div>
      <div className="rounded-xl bg-white/[0.03] p-3">
        <div className="text-xs text-muted">Mercado</div>
        <div className="mt-1 font-medium">{record.ai.marketCondition}</div>
      </div>
      <div className="rounded-xl bg-white/[0.03] p-3">
        <div className="text-xs text-muted">Latência</div>
        <div className="mt-1 font-medium">{record.latencyMs}ms</div>
      </div>
    </div>
  );
}

function Checklist({ record }: { record?: AnalysisRecord | null }) {
  if (!record) return null;
  return (
    <div className="space-y-2">
      {record.ai.checklist.map((item) => (
        <div key={item.label} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2 text-sm">
          <span className="text-zinc-300">{item.label}</span>
          <Badge tone={item.passed ? "success" : "warning"}>{item.passed ? "ok" : "não"}</Badge>
        </div>
      ))}
    </div>
  );
}

function Actions({ children }: { children?: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children ?? <Button variant="ghost">Sem ações</Button>}</div>;
}

export const AnalysisCard = {
  Root,
  Header,
  Signal: SignalView,
  Confidence,
  Reasoning,
  Details,
  Checklist,
  Actions
};
