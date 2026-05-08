import type { AnalysisRecord, Signal } from "../entities/Analysis";

export interface ConsensusSnapshot {
  directionAgreement: number;
  confidenceMean: number;
  flipCount: number;
  stabilityScore: number;
  dominantSignal: Signal;
  rangeLikelihood: number;
  volatilitySpike: boolean;
}

export interface TemporalConsensusEngine {
  observe(record: AnalysisRecord, windowSize: number): ConsensusSnapshot;
}
