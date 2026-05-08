import type { AISettings } from "@shared/domain/entities/Settings";
import type { MarketContextSnapshot, NewsHeadline } from "@shared/domain/entities/MarketContext";
import type { NewsContextProvider } from "@shared/domain/services/NewsContextProvider";
import { GeminiNewsProvider } from "@shared/infrastructure/google/GeminiNewsProvider";
import { GoogleNewsCryptoProvider } from "./GoogleNewsCryptoProvider";

export class MultiProviderNewsContextProvider implements NewsContextProvider {
  private readonly openRouterProvider = new GoogleNewsCryptoProvider();
  private readonly googleProvider = new GeminiNewsProvider();

  public fetchHeadlines(): Promise<NewsHeadline[]> {
    return this.openRouterProvider.fetchHeadlines();
  }

  public summarize(headlines: NewsHeadline[], settings: AISettings): Promise<MarketContextSnapshot> {
    if (settings.provider === "GOOGLE") {
      return this.googleProvider.summarize(headlines, settings);
    }
    return this.openRouterProvider.summarize(headlines, settings);
  }
}
