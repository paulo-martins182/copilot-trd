import type { SafeStorage } from "electron";
import type { SettingsRepository } from "@shared/domain/repositories/SettingsRepository";
import type { SqliteDatabase } from "@shared/infrastructure/database/SqliteDatabase";
import {
  defaultAISettings,
  defaultBrowserSettings,
  defaultRiskSettings,
  type AISettings,
  type AppSettings,
  type BrowserSettings,
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
    const rawAISettings = this.getRawJson("ai") ?? this.getRawJson("openrouter");

    return {
      risk: this.getJson("risk", defaultRiskSettings),
      ai: this.decodeAISettings(rawAISettings),
      browser: this.getJson("browser", defaultBrowserSettings)
    };
  }

  public async updateRisk(settings: RiskSettings): Promise<RiskSettings> {
    this.setJson("risk", settings);
    return settings;
  }

  public async updateAI(settings: AISettings): Promise<AISettings> {
    this.setJson("ai", this.encodeAISettings(settings));
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

  private getRawJson(key: string): Record<string, unknown> | null {
    const row = this.db.get<SettingsRow>("SELECT * FROM settings WHERE key = ?", [key]);
    if (!row) return null;
    return JSON.parse(row.value) as Record<string, unknown>;
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

  private encodeAISettings(settings: AISettings): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      provider: settings.provider,
      model: settings.model,
      fallbackModel: settings.fallbackModel,
      useMockProvider: settings.useMockProvider
    };
    const openRouterApiKey = settings.openRouterApiKey?.trim();
    const googleApiKey = settings.googleApiKey?.trim();
    if (this.safeStorage?.isEncryptionAvailable()) {
      if (openRouterApiKey) {
        payload.encryptedOpenRouterApiKey = this.safeStorage.encryptString(openRouterApiKey).toString("base64");
      }
      if (googleApiKey) {
        payload.encryptedGoogleApiKey = this.safeStorage.encryptString(googleApiKey).toString("base64");
      }
      return payload;
    }

    if (openRouterApiKey) {
      payload.openRouterApiKey = openRouterApiKey;
    }
    if (googleApiKey) {
      payload.googleApiKey = googleApiKey;
    }
    return payload;
  }

  private decodeAISettings(
    raw: (Partial<AISettings> & {
      apiKey?: string;
      encryptedApiKey?: string;
      encryptedOpenRouterApiKey?: string;
      encryptedGoogleApiKey?: string;
    }) | null
  ): AISettings {
    if (!raw) {
      return defaultAISettings;
    }

    const decoded: AISettings = {
      ...defaultAISettings,
      ...raw
    };

    if (raw.apiKey && !decoded.openRouterApiKey) {
      decoded.openRouterApiKey = raw.apiKey;
    }

    if (this.safeStorage?.isEncryptionAvailable()) {
      if (raw.encryptedApiKey && !decoded.openRouterApiKey) {
        decoded.openRouterApiKey = this.safeStorage.decryptString(Buffer.from(raw.encryptedApiKey, "base64"));
      }
      if (raw.encryptedOpenRouterApiKey) {
        decoded.openRouterApiKey = this.safeStorage.decryptString(Buffer.from(raw.encryptedOpenRouterApiKey, "base64"));
      }
      if (raw.encryptedGoogleApiKey) {
        decoded.googleApiKey = this.safeStorage.decryptString(Buffer.from(raw.encryptedGoogleApiKey, "base64"));
      }
    }

    return decoded;
  }
}
