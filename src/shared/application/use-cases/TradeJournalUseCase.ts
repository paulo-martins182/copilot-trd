import type { TradeJournalRepository } from "@shared/domain/repositories/TradeJournalRepository";
import type { TradeJournalEntry } from "@shared/domain/entities/TradeJournal";

export class TradeJournalUseCase {
  public constructor(private readonly repository: TradeJournalRepository) {}

  public create(input: Omit<TradeJournalEntry, "id" | "createdAt">) {
    const entry: TradeJournalEntry = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    return this.repository.create(entry);
  }

  public list(limit = 100) {
    return this.repository.list(limit);
  }

  public metrics() {
    return this.repository.metrics();
  }
}
