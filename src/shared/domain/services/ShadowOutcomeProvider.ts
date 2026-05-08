import type { AISettings } from "../entities/Settings";

export interface ShadowOutcomeProvider {
  evaluate(input: {
    baselineDataUrl: string;
    currentDataUrl: string;
    expectedSignal: "BUY" | "SELL";
    settings: AISettings;
  }): Promise<{
    outcome: "WIN" | "LOSS" | "UNCLEAR";
    reason: string;
  }>;
}
