import type { AppSettings, BrowserSettings, OpenRouterSettings, RiskSettings } from "../entities/Settings";

export interface SettingsRepository {
  getAll(): Promise<AppSettings>;
  updateRisk(settings: RiskSettings): Promise<RiskSettings>;
  updateOpenRouter(settings: OpenRouterSettings): Promise<OpenRouterSettings>;
  updateBrowser(settings: BrowserSettings): Promise<BrowserSettings>;
}
