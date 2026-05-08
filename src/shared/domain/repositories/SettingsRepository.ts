import type { AISettings, AppSettings, BrowserSettings, RiskSettings } from "../entities/Settings";

export interface SettingsRepository {
  getAll(): Promise<AppSettings>;
  updateRisk(settings: RiskSettings): Promise<RiskSettings>;
  updateAI(settings: AISettings): Promise<AISettings>;
  updateBrowser(settings: BrowserSettings): Promise<BrowserSettings>;
}
