import type { SettingsRepository } from "@shared/domain/repositories/SettingsRepository";
import type { AISettings, BrowserSettings, RiskSettings } from "@shared/domain/entities/Settings";

export class ManageSettingsUseCase {
  public constructor(private readonly repository: SettingsRepository) {}

  public getAll() {
    return this.repository.getAll();
  }

  public updateRisk(settings: RiskSettings) {
    return this.repository.updateRisk(settings);
  }

  public updateAI(settings: AISettings) {
    return this.repository.updateAI(settings);
  }

  public updateBrowser(settings: BrowserSettings) {
    return this.repository.updateBrowser(settings);
  }
}
