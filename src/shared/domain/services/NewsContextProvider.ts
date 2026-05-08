import type { MarketContextSnapshot, NewsHeadline } from "../entities/MarketContext";
import type { AISettings } from "../entities/Settings";

export interface NewsContextProvider {
  fetchHeadlines(): Promise<NewsHeadline[]>;
  summarize(headlines: NewsHeadline[], settings: AISettings): Promise<MarketContextSnapshot>;
}
