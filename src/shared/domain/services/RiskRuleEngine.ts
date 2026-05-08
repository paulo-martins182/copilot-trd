import type { AIAnalysis, AnalysisDecision, ProviderMode } from "../entities/Analysis";
import type { MarketContextSnapshot, SetupPerformance } from "../entities/MarketContext";
import type { RiskSettings } from "../entities/Settings";
import type { ConsensusSnapshot } from "./TemporalConsensusEngine";

export interface RiskRuleEngine {
  evaluate(input: RiskRuleInput): AnalysisDecision;
}

export interface RiskRuleInput {
  ai: AIAnalysis;
  latencyMs: number;
  isStale: boolean;
  settings: RiskSettings;
  providerMode: ProviderMode;
  marketContext: MarketContextSnapshot | null;
  consensus: ConsensusSnapshot;
  performance: SetupPerformance;
  lastAlertAtBySignal?: Partial<Record<"BUY" | "SELL", string>> | undefined;
}
