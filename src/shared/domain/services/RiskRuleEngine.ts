import type { AIAnalysis, AnalysisDecision } from "../entities/Analysis";
import type { RiskSettings } from "../entities/Settings";

export interface RiskRuleEngine {
  evaluate(input: RiskRuleInput): AnalysisDecision;
}

export interface RiskRuleInput {
  ai: AIAnalysis;
  latencyMs: number;
  isStale: boolean;
  settings: RiskSettings;
  lastAlertAtBySignal?: Partial<Record<"BUY" | "SELL", string>> | undefined;
}
