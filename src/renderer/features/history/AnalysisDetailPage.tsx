import { useEffect, useState } from "react";
import type { AnalysisRecord } from "@shared/domain/entities/Analysis";
import { AnalysisCard } from "@renderer/components/composition/AnalysisCard";
import { Card, CardTitle } from "@renderer/components/ui/card";
import { formatDateTime } from "@renderer/lib/format";

export function AnalysisDetailPage({ id }: { id: string }) {
  const [record, setRecord] = useState<AnalysisRecord | null>(null);

  useEffect(() => {
    void window.tradeScope.analysis.getById({ id }).then(setRecord);
  }, [id]);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto grid max-w-5xl grid-cols-[1fr_360px] gap-4">
        <AnalysisCard.Root>
          <AnalysisCard.Header title="Detalhes da analise" description={record ? formatDateTime(record.createdAt) : "Carregando"} />
          <AnalysisCard.Signal record={record} />
          <AnalysisCard.Confidence record={record} />
          <AnalysisCard.Reasoning record={record} />
          <AnalysisCard.Details record={record} />
          <AnalysisCard.Checklist record={record} />
        </AnalysisCard.Root>
        <Card>
          <CardTitle>Regras aplicadas</CardTitle>
          <div className="mt-4 space-y-2">
            {record?.decision.ruleReasons.map((reason) => (
              <div key={reason} className="rounded-xl bg-white/[0.03] p-3 text-sm text-zinc-300">
                {reason}
              </div>
            ))}
          </div>
          {record?.decision.blockedBy.length ? (
            <div className="mt-4 space-y-2">
              <div className="text-xs uppercase tracking-wide text-muted">Bloqueios</div>
              {record.decision.blockedBy.map((reason) => (
                <div key={reason} className="rounded-xl border border-warning/20 bg-warning/10 p-2 text-xs text-amber-200">
                  {reason}
                </div>
              ))}
            </div>
          ) : null}
          {record?.snapshotPath ? <div className="mt-4 text-xs text-muted">Snapshot local: {record.snapshotPath}</div> : null}
        </Card>
      </div>
    </div>
  );
}
