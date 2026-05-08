import type { AnalysisRecord, Signal } from "@shared/domain/entities/Analysis";
import type { ConsensusSnapshot, TemporalConsensusEngine } from "@shared/domain/services/TemporalConsensusEngine";

export class InMemoryTemporalConsensusEngine implements TemporalConsensusEngine {
  private readonly historyBySource = new Map<string, AnalysisRecord[]>();

  public observe(record: AnalysisRecord, windowSize: number): ConsensusSnapshot {
    const current = this.historyBySource.get(record.sourceId) ?? [];
    const next = [...current, record].slice(-windowSize);
    this.historyBySource.set(record.sourceId, next);

    const actionable = next.filter((item) => item.ai.signal === "BUY" || item.ai.signal === "SELL");
    const dominantSignal = this.findDominantSignal(actionable.map((item) => item.ai.signal));
    const dominantCount = actionable.filter((item) => item.ai.signal === dominantSignal).length;
    const directionAgreement = actionable.length > 0 ? dominantCount / actionable.length : 0;
    const confidenceMean =
      actionable.length > 0 ? actionable.reduce((sum, item) => sum + item.ai.confidence, 0) / actionable.length : 0;
    let flipCount = 0;
    for (let index = 1; index < actionable.length; index += 1) {
      if (actionable[index - 1]?.ai.signal !== actionable[index]?.ai.signal) {
        flipCount += 1;
      }
    }
    const rangingCount = next.filter((item) => item.ai.marketCondition === "RANGING").length;
    const volatileCount = next.filter((item) => item.ai.marketCondition === "VOLATILE").length;

    return {
      dominantSignal,
      directionAgreement: Number(directionAgreement.toFixed(2)),
      confidenceMean: Number(confidenceMean.toFixed(2)),
      flipCount,
      stabilityScore: Number(Math.max(0, directionAgreement - flipCount * 0.18).toFixed(2)),
      rangeLikelihood: Number((rangingCount / Math.max(1, next.length)).toFixed(2)),
      volatilitySpike: volatileCount / Math.max(1, next.length) >= 0.34
    };
  }

  private findDominantSignal(signals: Signal[]): Signal {
    const counts = new Map<Signal, number>();
    for (const signal of signals) {
      counts.set(signal, (counts.get(signal) ?? 0) + 1);
    }
    let winner: Signal = "WAIT";
    let winnerCount = 0;
    for (const [signal, count] of counts.entries()) {
      if (count > winnerCount) {
        winner = signal;
        winnerCount = count;
      }
    }
    return winner;
  }
}
