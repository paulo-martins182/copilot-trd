import type { PropsWithChildren, ReactNode } from "react";
import type { AnalysisRecord, Signal } from "@shared/domain/entities/Analysis";
import { Badge } from "@renderer/components/ui/badge";
import { Button } from "@renderer/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@renderer/components/ui/card";
import { cn } from "@renderer/lib/cn";
import { formatCurrency, formatExpiry, formatProviderMode, formatSignal } from "@renderer/lib/format";

function signalTone(signal: Signal) {
  if (signal === "BUY") return "success";
  if (signal === "SELL") return "danger";
  if (signal === "AVOID") return "warning";
  return "neutral";
}

function Root({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <Card className={cn("space-y-4", className)}>{children}</Card>;
}

function Header({ title = "Ultima analise", description }: { title?: string; description?: string }) {
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
  if (!record) return <Badge>Sem analise</Badge>;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge tone={signalTone(record.decision.finalSignal)}>{formatSignal(record.decision.finalSignal)}</Badge>
      <Badge tone="accent">{formatExpiry(record.decision.finalExpiry)}</Badge>
      {record.isStale ? <Badge tone="warning">Atrasado</Badge> : <Badge tone="success">Fresco</Badge>}
      <Badge tone={record.decision.providerMode === "REAL" ? "success" : "warning"}>
        {formatProviderMode(record.decision.providerMode)}
      </Badge>
    </div>
  );
}

function Confidence({ record }: { record?: AnalysisRecord | null }) {
  const confidence = record?.ai.confidence ?? 0;
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs text-muted">
        <span>Confianca IA</span>
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
      {record?.ai.reasoning ?? "Aguardando captura e analise do grafico."}
    </div>
  );
}

function Details({ record }: { record?: AnalysisRecord | null }) {
  if (!record) return null;
  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <Metric label="Risco" value={record.ai.riskLevel} />
      <Metric label="Valor maximo" value={formatCurrency(record.decision.suggestedStake)} />
      <Metric label="Mercado" value={record.ai.marketCondition} />
      <Metric label="Latencia" value={`${record.latencyMs}ms`} />
      <Metric label="Consenso" value={`${Math.round(record.decision.consensusScore * 100)}%`} />
      <Metric
        label="Win rate est."
        value={`${record.decision.empiricalWinRate}% / ${record.decision.sampleSupport} amostras`}
      />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.03] p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
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
          <Badge tone={item.passed ? "success" : "warning"}>{item.passed ? "ok" : "nao"}</Badge>
        </div>
      ))}
    </div>
  );
}

function Actions({ children }: { children?: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children ?? <Button variant="ghost">Sem acoes</Button>}</div>;
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
