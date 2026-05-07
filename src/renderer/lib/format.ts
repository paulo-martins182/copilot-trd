import type { Signal, SuggestedExpiry } from "@shared/domain/entities/Analysis";

export function formatSignal(signal: Signal): string {
  return {
    BUY: "Possível compra",
    SELL: "Possível venda",
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
