import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import initSqlJs, { type Database } from "sql.js";

type SqlValue = string | number | null;
interface TableInfoRow {
  name: string;
}

export class SqliteDatabase {
  private constructor(
    private readonly filePath: string,
    private readonly database: Database
  ) {}

  public static async create(filePath: string): Promise<SqliteDatabase> {
    const require = createRequire(import.meta.url);
    const wasmPath = require.resolve("sql.js/dist/sql-wasm.wasm");
    const SQL = await initSqlJs({ locateFile: () => wasmPath });
    const bytes = existsSync(filePath) ? readFileSync(filePath) : undefined;
    const database = bytes ? new SQL.Database(bytes) : new SQL.Database();
    const instance = new SqliteDatabase(filePath, database);
    instance.migrate();
    await instance.persist();
    return instance;
  }

  public exec(sql: string): void {
    this.database.exec(sql);
  }

  public run(sql: string, params: SqlValue[] = []): void {
    const statement = this.database.prepare(sql);
    try {
      statement.run(params);
    } finally {
      statement.free();
    }
  }

  public get<T>(sql: string, params: SqlValue[] = []): T | undefined {
    const statement = this.database.prepare(sql);
    try {
      statement.bind(params);
      if (!statement.step()) return undefined;
      return statement.getAsObject() as T;
    } finally {
      statement.free();
    }
  }

  public all<T>(sql: string, params: SqlValue[] = []): T[] {
    const statement = this.database.prepare(sql);
    const rows: T[] = [];
    try {
      statement.bind(params);
      while (statement.step()) {
        rows.push(statement.getAsObject() as T);
      }
      return rows;
    } finally {
      statement.free();
    }
  }

  public async persist(): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, Buffer.from(this.database.export()));
  }

  private migrate(): void {
    this.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS analyses (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        source_type TEXT NOT NULL,
        source_id TEXT NOT NULL,
        captured_at TEXT NOT NULL,
        analyzed_at TEXT NOT NULL,
        latency_ms INTEGER NOT NULL,
        is_stale INTEGER NOT NULL,
        snapshot_path TEXT NOT NULL,
        setup_label TEXT NOT NULL DEFAULT '',
        ai_json TEXT NOT NULL,
        decision_json TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS trade_journal_entries (
        id TEXT PRIMARY KEY,
        analysis_id TEXT,
        asset TEXT NOT NULL,
        entry_type TEXT NOT NULL,
        entry_time TEXT NOT NULL,
        result TEXT NOT NULL,
        stake REAL NOT NULL,
        payout REAL,
        notes TEXT NOT NULL,
        screenshot_path TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS copilot_alerts (
        id TEXT PRIMARY KEY,
        analysis_id TEXT NOT NULL,
        signal TEXT NOT NULL,
        emitted_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS market_context_snapshots (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        market_bias TEXT NOT NULL,
        risk_state TEXT NOT NULL,
        volatility_warning INTEGER NOT NULL,
        major_events_json TEXT NOT NULL,
        analysis_impact TEXT NOT NULL,
        headlines_json TEXT NOT NULL,
        provider_mode TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS shadow_predictions (
        id TEXT PRIMARY KEY,
        analysis_id TEXT NOT NULL,
        source_id TEXT NOT NULL,
        region_json TEXT NOT NULL,
        expected_signal TEXT NOT NULL,
        setup_label TEXT NOT NULL,
        snapshot_path TEXT NOT NULL,
        created_at TEXT NOT NULL,
        settle_after TEXT NOT NULL,
        settled_at TEXT,
        outcome TEXT,
        outcome_reason TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_trade_journal_entry_time ON trade_journal_entries(entry_time DESC);
      CREATE INDEX IF NOT EXISTS idx_market_context_updated_at ON market_context_snapshots(updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_shadow_predictions_source_settle ON shadow_predictions(source_id, settle_after);
      CREATE INDEX IF NOT EXISTS idx_shadow_predictions_setup ON shadow_predictions(setup_label);
    `);

    this.ensureColumn("analyses", "setup_label", "TEXT NOT NULL DEFAULT ''");
  }

  private ensureColumn(tableName: string, columnName: string, columnDefinition: string): void {
    const columns = this.all<TableInfoRow>(`PRAGMA table_info(${tableName})`);
    const exists = columns.some((column) => column.name === columnName);
    if (!exists) {
      this.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
    }
  }
}
