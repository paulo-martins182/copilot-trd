import type { Signal } from "./Analysis";

export type TradeResult = "WIN" | "LOSS" | "DOJI";

export interface TradeJournalEntry {
  id: string;
  analysisId?: string | undefined;
  asset: string;
  entryType: Signal;
  entryTime: string;
  result: TradeResult;
  stake: number;
  payout?: number | undefined;
  notes: string;
  screenshotPath?: string | undefined;
  createdAt: string;
}

export interface TradeJournalMetrics {
  totalTrades: number;
  winRate: number;
  lossRate: number;
  dojiRate: number;
  averageStake: number;
  signalsByType: Record<Signal, number>;
  avoidedSignals: number;
  averageConfidence: number;
  bestHours: Array<{ hour: string; winRate: number; total: number }>;
  frequentSetups: Array<{ label: string; total: number }>;
}
