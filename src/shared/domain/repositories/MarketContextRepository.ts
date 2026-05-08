import type { MarketContextSnapshot, ShadowPrediction, SetupPerformance } from "../entities/MarketContext";

export interface MarketContextRepository {
  getLatestContext(): Promise<MarketContextSnapshot | null>;
  saveContext(snapshot: MarketContextSnapshot): Promise<void>;
  createShadowPrediction(prediction: ShadowPrediction): Promise<void>;
  getMaturePendingPredictions(nowIso: string, sourceId: string): Promise<ShadowPrediction[]>;
  settleShadowPrediction(
    id: string,
    outcome: ShadowPrediction["outcome"],
    settledAt: string,
    outcomeReason: string
  ): Promise<void>;
  getSetupPerformance(setupLabel: string): Promise<SetupPerformance>;
  listRecentOutcomes(limit: number): Promise<ShadowPrediction[]>;
}
