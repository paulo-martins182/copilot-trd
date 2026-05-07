import type { AnalysisRecord } from "@shared/domain/entities/Analysis";

export function analysisToSummary(record: AnalysisRecord) {
  return {
    id: record.id,
    signal: record.decision.finalSignal,
    expiry: record.decision.finalExpiry,
    confidence: record.ai.confidence,
    riskLevel: record.ai.riskLevel,
    latencyMs: record.latencyMs,
    createdAt: record.createdAt
  };
}
