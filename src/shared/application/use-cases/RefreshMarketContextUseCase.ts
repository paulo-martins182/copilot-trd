import type { MarketContextRepository } from "@shared/domain/repositories/MarketContextRepository";
import type { NewsContextProvider } from "@shared/domain/services/NewsContextProvider";
import type { AISettings } from "@shared/domain/entities/Settings";

export class RefreshMarketContextUseCase {
  public constructor(
    private readonly repository: MarketContextRepository,
    private readonly provider: NewsContextProvider
  ) {}

  public async execute(settings: AISettings) {
    const headlines = await this.provider.fetchHeadlines();
    const snapshot = await this.provider.summarize(headlines, settings);
    await this.repository.saveContext(snapshot);
    return snapshot;
  }

  public getLatest() {
    return this.repository.getLatestContext();
  }
}
