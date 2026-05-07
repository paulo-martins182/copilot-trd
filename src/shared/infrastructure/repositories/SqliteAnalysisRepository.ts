import type { AnalysisRecord } from "@shared/domain/entities/Analysis";
import type { AnalysisRepository } from "@shared/domain/repositories/AnalysisRepository";
import type { SqliteDatabase } from "@shared/infrastructure/database/SqliteDatabase";

interface AnalysisRow {
  id: string;
  created_at: string;
  source_type: "BROWSER" | "SCREEN";
  source_id: string;
  captured_at: string;
  analyzed_at: string;
  latency_ms: number;
  is_stale: 0 | 1;
  snapshot_path: string;
  ai_json: string;
  decision_json: string;
}

export class SqliteAnalysisRepository implements AnalysisRepository {
  public constructor(private readonly db: SqliteDatabase) {}

  public async save(record: AnalysisRecord): Promise<void> {
    this.db.run(
      `
      INSERT INTO analyses (
        id, created_at, source_type, source_id, captured_at, analyzed_at,
        latency_ms, is_stale, snapshot_path, ai_json, decision_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        record.id,
        record.createdAt,
        record.sourceType,
        record.sourceId,
        record.capturedAt,
        record.analyzedAt,
        record.latencyMs,
        record.isStale ? 1 : 0,
        record.snapshotPath,
        JSON.stringify(record.ai),
        JSON.stringify(record.decision)
      ]
    );
    await this.db.persist();
  }

  public async findById(id: string): Promise<AnalysisRecord | null> {
    const row = this.db.get<AnalysisRow>("SELECT * FROM analyses WHERE id = ?", [id]);
    return row ? this.map(row) : null;
  }

  public async list(limit: number): Promise<AnalysisRecord[]> {
    const rows = this.db.all<AnalysisRow>("SELECT * FROM analyses ORDER BY created_at DESC LIMIT ?", [limit]);
    return rows.map((row) => this.map(row));
  }

  private map(row: AnalysisRow): AnalysisRecord {
    return {
      id: row.id,
      createdAt: row.created_at,
      sourceType: row.source_type,
      sourceId: row.source_id,
      capturedAt: row.captured_at,
      analyzedAt: row.analyzed_at,
      latencyMs: row.latency_ms,
      isStale: row.is_stale === 1,
      snapshotPath: row.snapshot_path,
      ai: JSON.parse(row.ai_json) as AnalysisRecord["ai"],
      decision: JSON.parse(row.decision_json) as AnalysisRecord["decision"]
    };
  }
}
