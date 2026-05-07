import type { AnalysisRecord } from "@shared/domain/entities/Analysis";
import { AnalysisCard } from "@renderer/components/composition/AnalysisCard";
import { Button } from "@renderer/components/ui/button";

export function RealtimeAnalysisPage({
  record,
  onOpenAnalysis
}: {
  record: AnalysisRecord | null;
  onOpenAnalysis: (id: string) => void;
}) {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-3xl">
        <AnalysisCard.Root>
          <AnalysisCard.Header title="Análise em tempo real" description="Último frame processado pelo copiloto." />
          <AnalysisCard.Signal record={record} />
          <AnalysisCard.Confidence record={record} />
          <AnalysisCard.Reasoning record={record} />
          <AnalysisCard.Details record={record} />
          <AnalysisCard.Checklist record={record} />
          <AnalysisCard.Actions>
            <Button disabled={!record} onClick={() => record && onOpenAnalysis(record.id)}>
              Abrir análise
            </Button>
          </AnalysisCard.Actions>
        </AnalysisCard.Root>
      </div>
    </div>
  );
}
