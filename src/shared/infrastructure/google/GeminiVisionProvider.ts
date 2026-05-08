import type { AIAnalysisProvider, AnalyzeFrameProviderInput } from "@shared/domain/services/AIAnalysisProvider";
import { aiAnalysisSchema } from "@shared/presentation/dtos/schemas";
import { tradingVisionSystemPrompt } from "@shared/infrastructure/ai/tradingVisionPrompt";
import { openRouterAnalysisResponseFormat } from "@shared/infrastructure/openrouter/openRouterAnalysisJsonSchema";
import { MockAIAnalysisProvider } from "@shared/infrastructure/openrouter/OpenRouterVisionProvider";
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

export class GeminiVisionProvider implements AIAnalysisProvider {
  private readonly client = new GeminiClient();

  public async analyzeFrame(input: AnalyzeFrameProviderInput) {
    if (input.settings.useMockProvider) {
      return new MockAIAnalysisProvider().analyzeFrame(input);
    }
    if (!input.settings.googleApiKey) {
      return this.unavailableResult("API key do Google AI ausente.");
    }

    try {
      const image = parseDataUrl(input.dataUrl);
      const parsed = await this.client.generateJson({
        apiKey: input.settings.googleApiKey,
        model: input.settings.model,
        systemInstruction: tradingVisionSystemPrompt,
        parts: [
          {
            text: "Analise este frame do grafico BTC/crypto. Bloqueie entrada ruim, detecte mercado lateral, destaque risco alto e retorne checklist visual."
          },
          {
            inlineData: image
          }
        ],
        responseJsonSchema: openRouterAnalysisResponseFormat.json_schema.schema,
        maxOutputTokens: 900
      });

      return {
        analysis: aiAnalysisSchema.parse(parsed),
        providerMode: "REAL" as const,
        modelUsed: input.settings.model
      };
    } catch (error) {
      return this.unavailableResult(error instanceof Error ? error.message : "Gemini analysis failed.");
    }
  }

  private unavailableResult(reason: string) {
    return {
      analysis: aiAnalysisSchema.parse({
        signal: "WAIT",
        confidence: 0,
        riskLevel: "HIGH",
        marketCondition: "UNCLEAR",
        suggestedExpiry: "NONE",
        reasoning: "Provider real indisponivel; entrada operacional bloqueada.",
        checklist: [
          { label: "Provider real disponivel", passed: false },
          { label: "Contexto tecnico confiavel", passed: false }
        ],
        warning: reason
      }),
      providerMode: "REAL_PROVIDER_UNAVAILABLE" as const,
      modelUsed: "unavailable"
    };
  }
}
