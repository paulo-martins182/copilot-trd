import type { SettingsRepository } from "@shared/domain/repositories/SettingsRepository";
import type { BrowserSettings, OpenRouterSettings, RiskSettings } from "@shared/domain/entities/Settings";

export class ManageSettingsUseCase {
  public constructor(private readonly repository: SettingsRepository) {}

  public getAll() {
    return this.repository.getAll();
  }

  public updateRisk(settings: RiskSettings) {
    return this.repository.updateRisk(settings);
  }

  public updateOpenRouter(settings: OpenRouterSettings) {
    return this.repository.updateOpenRouter(settings);
  }

  public updateBrowser(settings: BrowserSettings) {
    return this.repository.updateBrowser(settings);
  }
}
