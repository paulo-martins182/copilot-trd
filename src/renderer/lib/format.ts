import type { ProviderMode, Signal, SuggestedExpiry } from "@shared/domain/entities/Analysis";
import type { MarketBias, MacroRiskState } from "@shared/domain/entities/MarketContext";

export function formatSignal(signal: Signal): string {
  return {
    BUY: "Possivel compra",
    SELL: "Possivel venda",
    WAIT: "Aguardar",
    AVOID: "Evitar mercado"
  }[signal];
}

export function formatExpiry(expiry: SuggestedExpiry): string {
  return {
    ONE_MINUTE: "1 minuto",
    TWO_MINUTES: "2 minutos",
    FIVE_MINUTES: "5 minutos",
    NONE: "Sem entrada"
  }[expiry];
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2
  }).format(value);
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium"
  }).format(new Date(value));
}

export function formatProviderMode(mode: ProviderMode): string {
  return {
    REAL: "REAL",
    MOCK: "MOCK",
    REAL_PROVIDER_UNAVAILABLE: "REAL OFF",
    SHADOW_ONLY: "SHADOW"
  }[mode];
}

export function formatMarketBias(bias: MarketBias): string {
  return {
    BULLISH: "Bullish",
    BEARISH: "Bearish",
    NEUTRAL: "Neutral",
    MIXED: "Mixed"
  }[bias];
}

export function formatMacroRisk(risk: MacroRiskState): string {
  return {
    LOW: "Risco baixo",
    MEDIUM: "Risco medio",
    HIGH: "Risco alto"
  }[risk];
}
