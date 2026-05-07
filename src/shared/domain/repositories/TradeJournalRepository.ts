import type { TradeJournalEntry, TradeJournalMetrics } from "../entities/TradeJournal";

export interface TradeJournalRepository {
  create(entry: TradeJournalEntry): Promise<void>;
  list(limit: number): Promise<TradeJournalEntry[]>;
  metrics(): Promise<TradeJournalMetrics>;
}
