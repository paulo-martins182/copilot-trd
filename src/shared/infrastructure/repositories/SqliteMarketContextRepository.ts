import type { MarketContextRepository } from "@shared/domain/repositories/MarketContextRepository";
import type { MarketContextSnapshot, SetupPerformance, ShadowPrediction } from "@shared/domain/entities/MarketContext";
import type { SqliteDatabase } from "@shared/infrastructure/database/SqliteDatabase";

interface MarketContextRow {
  id: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  market_bias: MarketContextSnapshot["marketBias"];
  risk_state: MarketContextSnapshot["riskState"];
  volatility_warning: 0 | 1;
  major_events_json: string;
  analysis_impact: string;
  headlines_json: string;
  provider_mode: MarketContextSnapshot["providerMode"];
}

interface ShadowPredictionRow {
  id: string;
  analysis_id: string;
  source_id: string;
  region_json: string;
  expected_signal: ShadowPrediction["expectedSignal"];
  setup_label: string;
  snapshot_path: string;
  created_at: string;
  settle_after: string;
  settled_at?: string;
  outcome?: ShadowPrediction["outcome"];
  outcome_reason?: string;
}

export class SqliteMarketContextRepository implements MarketContextRepository {
  public constructor(private readonly db: SqliteDatabase) {}

  public async getLatestContext(): Promise<MarketContextSnapshot | null> {
    const row = this.db.get<MarketContextRow>(
      "SELECT * FROM market_context_snapshots ORDER BY updated_at DESC LIMIT 1"
    );
    return row ? this.mapContext(row) : null;
  }

  public async saveContext(snapshot: MarketContextSnapshot): Promise<void> {
    this.db.run(
      `
      INSERT INTO market_context_snapshots (
        id, created_at, updated_at, expires_at, market_bias, risk_state, volatility_warning,
        major_events_json, analysis_impact, headlines_json, provider_mode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        snapshot.id,
        snapshot.createdAt,
        snapshot.updatedAt,
        snapshot.expiresAt,
        snapshot.marketBias,
        snapshot.riskState,
        snapshot.volatilityWarning ? 1 : 0,
        JSON.stringify(snapshot.majorEvents),
        snapshot.analysisImpact,
        JSON.stringify(snapshot.headlines),
        snapshot.providerMode
      ]
    );
    await this.db.persist();
  }

  public async createShadowPrediction(prediction: ShadowPrediction): Promise<void> {
    this.db.run(
      `
      INSERT INTO shadow_predictions (
        id, analysis_id, source_id, region_json, expected_signal, setup_label,
        snapshot_path, created_at, settle_after, settled_at, outcome, outcome_reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        prediction.id,
        prediction.analysisId,
        prediction.sourceId,
        prediction.regionJson,
        prediction.expectedSignal,
        prediction.setupLabel,
        prediction.snapshotPath,
        prediction.createdAt,
        prediction.settleAfter,
        prediction.settledAt ?? null,
        prediction.outcome ?? null,
        prediction.outcomeReason ?? null
      ]
    );
    await this.db.persist();
  }

  public async getMaturePendingPredictions(nowIso: string, sourceId: string): Promise<ShadowPrediction[]> {
    const rows = this.db.all<ShadowPredictionRow>(
      `
      SELECT * FROM shadow_predictions
      WHERE source_id = ? AND settled_at IS NULL AND settle_after <= ?
      ORDER BY settle_after ASC
    `,
      [sourceId, nowIso]
    );
    return rows.map((row) => this.mapPrediction(row));
  }

  public async settleShadowPrediction(
    id: string,
    outcome: ShadowPrediction["outcome"],
    settledAt: string,
    outcomeReason: string
  ): Promise<void> {
    this.db.run(
      `
      UPDATE shadow_predictions
      SET settled_at = ?, outcome = ?, outcome_reason = ?
      WHERE id = ?
    `,
      [settledAt, outcome ?? null, outcomeReason, id]
    );
    await this.db.persist();
  }

  public async getSetupPerformance(setupLabel: string): Promise<SetupPerformance> {
    const rows = this.db.all<{ outcome?: string }>(
      "SELECT outcome FROM shadow_predictions WHERE setup_label = ? AND settled_at IS NOT NULL",
      [setupLabel]
    );
    const total = rows.length;
    const wins = rows.filter((row) => row.outcome === "WIN").length;
    const losses = rows.filter((row) => row.outcome === "LOSS").length;
    const unclear = rows.filter((row) => row.outcome === "UNCLEAR").length;
    return {
      setupLabel,
      total,
      wins,
      losses,
      unclear,
      empiricalWinRate: total > 0 ? Number(((wins / total) * 100).toFixed(2)) : 0
    };
  }

  public async listRecentOutcomes(limit: number): Promise<ShadowPrediction[]> {
    const rows = this.db.all<ShadowPredictionRow>(
      "SELECT * FROM shadow_predictions ORDER BY created_at DESC LIMIT ?",
      [limit]
    );
    return rows.map((row) => this.mapPrediction(row));
  }

  private mapContext(row: MarketContextRow): MarketContextSnapshot {
    return {
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      expiresAt: row.expires_at,
      marketBias: row.market_bias,
      riskState: row.risk_state,
      volatilityWarning: row.volatility_warning === 1,
      majorEvents: JSON.parse(row.major_events_json) as string[],
      analysisImpact: row.analysis_impact,
      headlines: JSON.parse(row.headlines_json) as MarketContextSnapshot["headlines"],
      providerMode: row.provider_mode
    };
  }

  private mapPrediction(row: ShadowPredictionRow): ShadowPrediction {
    return {
      id: row.id,
      analysisId: row.analysis_id,
      sourceId: row.source_id,
      regionJson: row.region_json,
      expectedSignal: row.expected_signal,
      setupLabel: row.setup_label,
      snapshotPath: row.snapshot_path,
      createdAt: row.created_at,
      settleAfter: row.settle_after,
      settledAt: row.settled_at,
      outcome: row.outcome,
      outcomeReason: row.outcome_reason
    };
  }
}
