import type { Signal } from "@shared/domain/entities/Analysis";
import type { TradeJournalEntry, TradeJournalMetrics } from "@shared/domain/entities/TradeJournal";
import type { TradeJournalRepository } from "@shared/domain/repositories/TradeJournalRepository";
import type { SqliteDatabase } from "@shared/infrastructure/database/SqliteDatabase";

interface TradeJournalRow {
  id: string;
  analysis_id?: string;
  asset: string;
  entry_type: Signal;
  entry_time: string;
  result: "WIN" | "LOSS" | "DOJI";
  stake: number;
  payout?: number;
  notes: string;
  screenshot_path?: string;
  created_at: string;
}

export class SqliteTradeJournalRepository implements TradeJournalRepository {
  public constructor(private readonly db: SqliteDatabase) {}

  public async create(entry: TradeJournalEntry): Promise<void> {
    this.db.run(
      `
      INSERT INTO trade_journal_entries (
        id, analysis_id, asset, entry_type, entry_time, result,
        stake, payout, notes, screenshot_path, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        entry.id,
        entry.analysisId ?? null,
        entry.asset,
        entry.entryType,
        entry.entryTime,
        entry.result,
        entry.stake,
        entry.payout ?? null,
        entry.notes,
        entry.screenshotPath ?? null,
        entry.createdAt
      ]
    );
    await this.db.persist();
  }

  public async list(limit: number): Promise<TradeJournalEntry[]> {
    const rows = this.db.all<TradeJournalRow>("SELECT * FROM trade_journal_entries ORDER BY entry_time DESC LIMIT ?", [limit]);
    return rows.map((row) => this.map(row));
  }

  public async metrics(): Promise<TradeJournalMetrics> {
    const entries = await this.list(1000);
    const total = entries.length;
    const wins = entries.filter((entry) => entry.result === "WIN").length;
    const losses = entries.filter((entry) => entry.result === "LOSS").length;
    const dojis = entries.filter((entry) => entry.result === "DOJI").length;
    const signalsByType: Record<Signal, number> = { BUY: 0, SELL: 0, WAIT: 0, AVOID: 0 };
    for (const entry of entries) {
      signalsByType[entry.entryType] += 1;
    }

    const averageStake = total > 0 ? entries.reduce((sum, entry) => sum + entry.stake, 0) / total : 0;
    const analysisRows = this.db.all<{
      ai_json: string;
      decision_json: string;
    }>("SELECT ai_json, decision_json FROM analyses");
    const avoidedSignals = analysisRows.filter((row) => {
      const decision = JSON.parse(row.decision_json) as { finalSignal: Signal };
      return decision.finalSignal === "AVOID";
    }).length;
    const averageConfidence =
      analysisRows.length > 0
        ? analysisRows.reduce((sum, row) => sum + (JSON.parse(row.ai_json) as { confidence: number }).confidence, 0) /
          analysisRows.length
        : 0;

    return {
      totalTrades: total,
      winRate: total > 0 ? Number(((wins / total) * 100).toFixed(2)) : 0,
      lossRate: total > 0 ? Number(((losses / total) * 100).toFixed(2)) : 0,
      dojiRate: total > 0 ? Number(((dojis / total) * 100).toFixed(2)) : 0,
      averageStake: Number(averageStake.toFixed(2)),
      signalsByType,
      avoidedSignals,
      averageConfidence: Number(averageConfidence.toFixed(2)),
      bestHours: this.calculateBestHours(entries),
      frequentSetups: this.calculateFrequentSetups(analysisRows)
    };
  }

  private map(row: TradeJournalRow): TradeJournalEntry {
    return {
      id: row.id,
      analysisId: row.analysis_id,
      asset: row.asset,
      entryType: row.entry_type,
      entryTime: row.entry_time,
      result: row.result,
      stake: row.stake,
      payout: row.payout,
      notes: row.notes,
      screenshotPath: row.screenshot_path,
      createdAt: row.created_at
    };
  }

  private calculateBestHours(entries: TradeJournalEntry[]) {
    const buckets = new Map<string, { total: number; wins: number }>();
    for (const entry of entries) {
      const hour = new Date(entry.entryTime).getHours().toString().padStart(2, "0");
      const bucket = buckets.get(hour) ?? { total: 0, wins: 0 };
      bucket.total += 1;
      bucket.wins += entry.result === "WIN" ? 1 : 0;
      buckets.set(hour, bucket);
    }
    return [...buckets.entries()]
      .map(([hour, bucket]) => ({
        hour: `${hour}:00`,
        winRate: bucket.total > 0 ? Number(((bucket.wins / bucket.total) * 100).toFixed(2)) : 0,
        total: bucket.total
      }))
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 5);
  }

  private calculateFrequentSetups(rows: Array<{ ai_json: string }>) {
    const buckets = new Map<string, number>();
    for (const row of rows) {
      const ai = JSON.parse(row.ai_json) as { marketCondition: string; riskLevel: string };
      const label = `${ai.marketCondition} / ${ai.riskLevel}`;
      buckets.set(label, (buckets.get(label) ?? 0) + 1);
    }
    return [...buckets.entries()]
      .map(([label, total]) => ({ label, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }
}
