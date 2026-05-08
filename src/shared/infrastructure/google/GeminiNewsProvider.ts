import type { AISettings } from "@shared/domain/entities/Settings";
import type { MarketContextSnapshot, NewsHeadline } from "@shared/domain/entities/MarketContext";
import type { NewsContextProvider } from "@shared/domain/services/NewsContextProvider";
import { openRouterNewsJsonSchema } from "@shared/infrastructure/openrouter/openRouterNewsJsonSchema";
import { GeminiClient } from "./GeminiClient";

function clean(value: string): string {
  return value.replace(/<!\[CDATA\[|\]\]>/g, "").trim();
}

export class GeminiNewsProvider implements NewsContextProvider {
  private readonly client = new GeminiClient();
  private readonly feedUrl =
    "https://news.google.com/rss/search?q=bitcoin%20OR%20btc%20OR%20crypto%20market%20when%3A1d&hl=en-US&gl=US&ceid=US:en";

  public async fetchHeadlines(): Promise<NewsHeadline[]> {
    const response = await fetch(this.feedUrl);
    if (!response.ok) {
      throw new Error(`Google News RSS failed with status ${response.status}.`);
    }
    const xml = await response.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 10);
    return items.map((match) => {
      const block = match[1] ?? "";
      const title = /<title>([\s\S]*?)<\/title>/.exec(block)?.[1] ?? "Untitled";
      const link = /<link>([\s\S]*?)<\/link>/.exec(block)?.[1] ?? "";
      const pubDate = /<pubDate>([\s\S]*?)<\/pubDate>/.exec(block)?.[1];
      const source = /<source[^>]*>([\s\S]*?)<\/source>/.exec(block)?.[1] ?? "Google News";
      return {
        title: clean(title),
        url: clean(link),
        source: clean(source),
        publishedAt: pubDate ? new Date(pubDate).toISOString() : undefined
      };
    });
  }

  public async summarize(headlines: NewsHeadline[], settings: AISettings): Promise<MarketContextSnapshot> {
    const now = new Date();
    const fallbackExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    if (!settings.googleApiKey || settings.useMockProvider) {
      return {
        id: crypto.randomUUID(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        expiresAt: fallbackExpiresAt,
        marketBias: "MIXED",
        riskState: "MEDIUM",
        volatilityWarning: true,
        majorEvents: ["Contexto macro indisponivel sem provider real."],
        analysisImpact: "Sem resumo real de noticias, o filtro macro permanece conservador.",
        headlines,
        providerMode: "MOCK"
      };
    }

    const parsed = (await this.client.generateJson({
      apiKey: settings.googleApiKey,
      model: settings.model,
      systemInstruction:
        "Resuma noticias diarias de bitcoin e crypto como contexto macro para um copiloto tecnico. Nao gere trade. Retorne apenas risco, vies e impacto prudente.",
      parts: [{ text: JSON.stringify(headlines) }],
      responseJsonSchema: openRouterNewsJsonSchema.json_schema.schema,
      maxOutputTokens: 700
    })) as {
      marketBias: MarketContextSnapshot["marketBias"];
      riskState: MarketContextSnapshot["riskState"];
      volatilityWarning: boolean;
      majorEvents: string[];
      analysisImpact: string;
      expiresAt: string;
    };

    return {
      id: crypto.randomUUID(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt: new Date(parsed.expiresAt).toISOString(),
      marketBias: parsed.marketBias,
      riskState: parsed.riskState,
      volatilityWarning: parsed.volatilityWarning,
      majorEvents: parsed.majorEvents,
      analysisImpact: parsed.analysisImpact,
      headlines,
      providerMode: "REAL"
    };
  }
}
