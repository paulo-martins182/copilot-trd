export type Signal = "BUY" | "SELL" | "WAIT" | "AVOID";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type MarketCondition = "TRENDING" | "RANGING" | "VOLATILE" | "UNCLEAR";
export type SuggestedExpiry = "ONE_MINUTE" | "TWO_MINUTES" | "FIVE_MINUTES" | "NONE";
export type SourceType = "BROWSER" | "SCREEN";
export type ProviderMode = "REAL" | "MOCK" | "REAL_PROVIDER_UNAVAILABLE" | "SHADOW_ONLY";

export interface AnalysisChecklistItem {
  label: string;
  passed: boolean;
}

export interface AIAnalysis {
  signal: Signal;
  confidence: number;
  riskLevel: RiskLevel;
  marketCondition: MarketCondition;
  suggestedExpiry: SuggestedExpiry;
  reasoning: string;
  checklist: AnalysisChecklistItem[];
  warning: string;
}

export interface AnalysisDecision {
  originalSignal: Signal;
  finalSignal: Signal;
  finalExpiry: SuggestedExpiry;
  suggestedStake: number;
  ruleReasons: string[];
  shouldAlert: boolean;
  providerMode: ProviderMode;
  consensusScore: number;
  empiricalWinRate: number;
  sampleSupport: number;
  macroContextApplied: boolean;
  blockedBy: string[];
}

export interface FrameMetadata {
  sourceType: SourceType;
  sourceId: string;
  region: CaptureRegion;
  capturedAt: string;
}

export interface CaptureRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AnalysisRecord {
  id: string;
  createdAt: string;
  sourceType: SourceType;
  sourceId: string;
  capturedAt: string;
  analyzedAt: string;
  latencyMs: number;
  isStale: boolean;
  snapshotPath: string;
  ai: AIAnalysis;
  decision: AnalysisDecision;
  setupLabel: string;
}
