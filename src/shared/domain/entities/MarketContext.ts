import type { ProviderMode, Signal } from "./Analysis";

export type MarketBias = "BULLISH" | "BEARISH" | "NEUTRAL" | "MIXED";
export type MacroRiskState = "LOW" | "MEDIUM" | "HIGH";

export interface NewsHeadline {
  title: string;
  source: string;
  url: string;
  publishedAt?: string | undefined;
}

export interface MarketContextSnapshot {
  id: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  marketBias: MarketBias;
  riskState: MacroRiskState;
  volatilityWarning: boolean;
  majorEvents: string[];
  analysisImpact: string;
  headlines: NewsHeadline[];
  providerMode: ProviderMode;
}

export interface ContextSignalImpact {
  alignedWithSignal: boolean;
  confidenceAdjustment: number;
  blockedBy: string[];
}

export interface ShadowPrediction {
  id: string;
  analysisId: string;
  sourceId: string;
  regionJson: string;
  expectedSignal: Extract<Signal, "BUY" | "SELL">;
  setupLabel: string;
  snapshotPath: string;
  createdAt: string;
  settleAfter: string;
  settledAt?: string | undefined;
  outcome?: "WIN" | "LOSS" | "UNCLEAR" | undefined;
  outcomeReason?: string | undefined;
}

export interface SetupPerformance {
  setupLabel: string;
  total: number;
  wins: number;
  losses: number;
  unclear: number;
  empiricalWinRate: number;
}
