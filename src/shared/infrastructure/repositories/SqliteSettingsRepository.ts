import type { SafeStorage } from "electron";
import type { SettingsRepository } from "@shared/domain/repositories/SettingsRepository";
import type { SqliteDatabase } from "@shared/infrastructure/database/SqliteDatabase";
import {
  defaultBrowserSettings,
  defaultOpenRouterSettings,
  defaultRiskSettings,
  type AppSettings,
  type BrowserSettings,
  type OpenRouterSettings,
  type RiskSettings
} from "@shared/domain/entities/Settings";

interface SettingsRow {
  key: string;
  value: string;
  updated_at: string;
}

export class SqliteSettingsRepository implements SettingsRepository {
  public constructor(
    private readonly db: SqliteDatabase,
    private readonly safeStorage?: Pick<SafeStorage, "isEncryptionAvailable" | "encryptString" | "decryptString">
  ) {}

  public async getAll(): Promise<AppSettings> {
    return {
      risk: this.getJson("risk", defaultRiskSettings),
      openrouter: this.decodeOpenRouterSettings(this.getJson("openrouter", defaultOpenRouterSettings)),
      browser: this.getJson("browser", defaultBrowserSettings)
    };
  }

  public async updateRisk(settings: RiskSettings): Promise<RiskSettings> {
    this.setJson("risk", settings);
    return settings;
  }

  public async updateOpenRouter(settings: OpenRouterSettings): Promise<OpenRouterSettings> {
    this.setJson("openrouter", this.encodeOpenRouterSettings(settings));
    return settings;
  }

  public async updateBrowser(settings: BrowserSettings): Promise<BrowserSettings> {
    this.setJson("browser", settings);
    return settings;
  }

  private getJson<T>(key: string, fallback: T): T {
    const row = this.db.get<SettingsRow>("SELECT * FROM settings WHERE key = ?", [key]);
    if (!row) return fallback;
    return { ...fallback, ...(JSON.parse(row.value) as Partial<T>) };
  }

  private setJson(key: string, value: unknown): void {
    this.db.run(
      `
      INSERT INTO settings (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `,
      [key, JSON.stringify(value), new Date().toISOString()]
    );
    void this.db.persist();
  }

  private encodeOpenRouterSettings(settings: OpenRouterSettings): Record<string, unknown> {
    const apiKey = settings.apiKey?.trim();
    if (!apiKey) {
      return {
        model: settings.model,
        fallbackModel: settings.fallbackModel,
        useMockProvider: settings.useMockProvider
      };
    }

    if (this.safeStorage?.isEncryptionAvailable()) {
      return {
        model: settings.model,
        fallbackModel: settings.fallbackModel,
        useMockProvider: settings.useMockProvider,
        encryptedApiKey: this.safeStorage.encryptString(apiKey).toString("base64")
      };
    }

    return {
      model: settings.model,
      fallbackModel: settings.fallbackModel,
      useMockProvider: settings.useMockProvider,
      apiKey
    };
  }

  private decodeOpenRouterSettings(raw: OpenRouterSettings & { encryptedApiKey?: string }): OpenRouterSettings {
    if (raw.encryptedApiKey && this.safeStorage?.isEncryptionAvailable()) {
      return {
        model: raw.model,
        fallbackModel: raw.fallbackModel,
        useMockProvider: raw.useMockProvider,
        apiKey: this.safeStorage.decryptString(Buffer.from(raw.encryptedApiKey, "base64"))
      };
    }
    return raw;
  }
}
