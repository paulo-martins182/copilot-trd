import type { AISettings } from "@shared/domain/entities/Settings";
import type { ShadowOutcomeProvider } from "@shared/domain/services/ShadowOutcomeProvider";
import { openRouterShadowOutcomeJsonSchema } from "@shared/infrastructure/openrouter/openRouterShadowOutcomeJsonSchema";
import { GeminiClient } from "./GeminiClient";

function parseDataUrl(dataUrl: string) {
  const match = /^data:(.+?);base64,(.+)$/.exec(dataUrl);
  const mimeType = match?.[1];
  const data = match?.[2];
  if (!mimeType || !data) {
    throw new Error("Data URL invalida para Gemini.");
  }
  return {
    mimeType,
    data
  };
}

export class GeminiShadowOutcomeProvider implements ShadowOutcomeProvider {
  private readonly client = new GeminiClient();

  public async evaluate(input: {
    baselineDataUrl: string;
    currentDataUrl: string;
    expectedSignal: "BUY" | "SELL";
    settings: AISettings;
  }) {
    if (!input.settings.googleApiKey || input.settings.useMockProvider) {
      return {
        outcome: "UNCLEAR" as const,
        reason: "Provider real indisponivel para validar outcome."
      };
    }

    const baseline = parseDataUrl(input.baselineDataUrl);
    const current = parseDataUrl(input.currentDataUrl);
    return (await this.client.generateJson({
      apiKey: input.settings.googleApiKey,
      model: input.settings.model,
      systemInstruction:
        "Compare dois frames do mesmo grafico BTC separados por 2 minutos. Determine se o preco final ficou maior ou menor do que no frame inicial para validar uma previsao BUY/SELL.",
      parts: [
        { text: `Predicao esperada: ${input.expectedSignal}. Imagem 1 = inicio. Imagem 2 = fim.` },
        { inlineData: baseline },
        { inlineData: current }
      ],
      responseJsonSchema: openRouterShadowOutcomeJsonSchema.json_schema.schema,
      maxOutputTokens: 350
    })) as {
      outcome: "WIN" | "LOSS" | "UNCLEAR";
      reason: string;
    };
  }
}
