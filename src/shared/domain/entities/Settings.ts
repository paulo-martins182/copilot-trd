import type { SuggestedExpiry } from "./Analysis";

export interface RiskSettings {
  bankroll: number;
  riskPercent: number;
  maxStake: number;
  minConfidence: number;
  staleAfterMs: number;
  maxOneMinuteLatencyMs: number;
  alertCooldownMs: number;
  enabledExpiries: SuggestedExpiry[];
}

export interface OpenRouterSettings {
  apiKey?: string | undefined;
  model: string;
  fallbackModel: string;
  useMockProvider: boolean;
}

export interface AppSettings {
  risk: RiskSettings;
  openrouter: OpenRouterSettings;
  browser: BrowserSettings;
}

export interface BrowserSettings {
  defaultUrl: string;
}

export const defaultRiskSettings: RiskSettings = {
  bankroll: 1000,
  riskPercent: 1,
  maxStake: 50,
  minConfidence: 65,
  staleAfterMs: 2500,
  maxOneMinuteLatencyMs: 1200,
  alertCooldownMs: 15000,
  enabledExpiries: ["ONE_MINUTE", "TWO_MINUTES", "FIVE_MINUTES"]
};

export const defaultOpenRouterSettings: OpenRouterSettings = {
  model: "google/gemma-4-31b-it:free",
  fallbackModel: "openrouter/free",
  useMockProvider: false
};

export const defaultBrowserSettings: BrowserSettings = {
  defaultUrl: "https://www.tradingview.com/chart/"
};
