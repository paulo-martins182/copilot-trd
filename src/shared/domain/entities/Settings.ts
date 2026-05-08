import type { SuggestedExpiry } from "./Analysis";

export type AIProviderKind = "OPENROUTER" | "GOOGLE";

export interface RiskSettings {
  bankroll: number;
  riskPercent: number;
  maxStake: number;
  minConfidence: number;
  staleAfterMs: number;
  maxOneMinuteLatencyMs: number;
  alertCooldownMs: number;
  enabledExpiries: SuggestedExpiry[];
  requireRealProvider: boolean;
  riskFilterOnly: boolean;
  consensusWindowSize: number;
  minConsensusScore: number;
  minSampleSupport: number;
  minEmpiricalWinRate: number;
}

export interface AIModelOption {
  value: string;
  label: string;
  provider: AIProviderKind;
  supportsVision: boolean;
  supportsStructuredOutput: boolean;
  tier: "FREE" | "PAID";
}

export interface AISettings {
  provider: AIProviderKind;
  openRouterApiKey?: string | undefined;
  googleApiKey?: string | undefined;
  model: string;
  fallbackModel: string;
  useMockProvider: boolean;
}

export interface AppSettings {
  risk: RiskSettings;
  ai: AISettings;
  browser: BrowserSettings;
}

export interface BrowserSettings {
  defaultUrl: string;
  targetAsset: string;
  targetExpiry: SuggestedExpiry;
}

export const defaultRiskSettings: RiskSettings = {
  bankroll: 1000,
  riskPercent: 1,
  maxStake: 50,
  minConfidence: 65,
  staleAfterMs: 2500,
  maxOneMinuteLatencyMs: 1200,
  alertCooldownMs: 15000,
  enabledExpiries: ["TWO_MINUTES"],
  requireRealProvider: true,
  riskFilterOnly: true,
  consensusWindowSize: 5,
  minConsensusScore: 0.82,
  minSampleSupport: 5,
  minEmpiricalWinRate: 80
};

export const aiModelCatalog: AIModelOption[] = [
  {
    value: "google/gemma-4-26b-a4b-it:free",
    label: "OpenRouter · Gemma 4 26B A4B (free)",
    provider: "OPENROUTER",
    supportsVision: true,
    supportsStructuredOutput: true,
    tier: "FREE"
  },
  {
    value: "google/gemma-4-31b-it:free",
    label: "OpenRouter · Gemma 4 31B (free)",
    provider: "OPENROUTER",
    supportsVision: true,
    supportsStructuredOutput: true,
    tier: "FREE"
  },
  {
    value: "openrouter/free",
    label: "OpenRouter · Free router",
    provider: "OPENROUTER",
    supportsVision: true,
    supportsStructuredOutput: true,
    tier: "FREE"
  },
  {
    value: "gemini-2.5-flash",
    label: "Google AI · Gemini 2.5 Flash",
    provider: "GOOGLE",
    supportsVision: true,
    supportsStructuredOutput: true,
    tier: "PAID"
  },
  {
    value: "gemini-2.5-flash-lite",
    label: "Google AI · Gemini 2.5 Flash Lite",
    provider: "GOOGLE",
    supportsVision: true,
    supportsStructuredOutput: true,
    tier: "PAID"
  }
];

export const defaultAISettings: AISettings = {
  provider: "OPENROUTER",
  model: "google/gemma-4-26b-a4b-it:free",
  fallbackModel: "google/gemma-4-31b-it:free",
  useMockProvider: false
};

export type OpenRouterSettings = AISettings;

export const defaultBrowserSettings: BrowserSettings = {
  defaultUrl: "https://www.tradingview.com/chart/",
  targetAsset: "BTCUSD",
  targetExpiry: "TWO_MINUTES"
};
