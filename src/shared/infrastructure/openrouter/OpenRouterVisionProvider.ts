import type { AIAnalysisProvider, AnalyzeFrameProviderInput } from "@shared/domain/services/AIAnalysisProvider";
import { aiAnalysisSchema } from "@shared/presentation/dtos/schemas";
import { tradingVisionSystemPrompt } from "../ai/tradingVisionPrompt";
import { OpenRouterClient } from "./OpenRouterClient";
import { openRouterAnalysisResponseFormat } from "./openRouterAnalysisJsonSchema";

type OpenRouterMessage = Record<string, unknown>;

const curatedFreeVisionModels = [
  "google/gemma-4-26b-a4b-it:free",
  "google/gemma-4-31b-it:free",
  "openrouter/free"
] as const;

function shouldRetryWithoutStructuredOutput(error: unknown) {
  return (
    error instanceof Error &&
    /No endpoints found that can handle the requested parameters|response_format|provider routing|structured/i.test(
      error.message
    )
  );
}

function shouldTryNextModel(error: unknown) {
  return (
    error instanceof Error &&
    /Provider returned error|did not include text content|503|502|429|temporar|timeout|overloaded|No endpoints found/i.test(
      error.message
    )
  );
}

function createModelsToTry(primaryModel: string, fallbackModel: string) {
  return [...new Set([primaryModel, fallbackModel, ...curatedFreeVisionModels])];
}

export class OpenRouterVisionProvider implements AIAnalysisProvider {
  private readonly client = new OpenRouterClient();

  public async analyzeFrame(input: AnalyzeFrameProviderInput) {
    if (input.settings.useMockProvider) {
      return new MockAIAnalysisProvider().analyzeFrame(input);
    }
    if (!input.settings.openRouterApiKey) {
      return this.unavailableResult("API key da OpenRouter ausente.");
    }

    const primaryModel = input.settings.model || "google/gemma-4-26b-a4b-it:free";
    const fallbackModel = input.settings.fallbackModel || "google/gemma-4-31b-it:free";
    const modelsToTry = createModelsToTry(primaryModel, fallbackModel);
    const errorsByModel: string[] = [];

    for (const model of modelsToTry) {
      try {
        const systemMessage: OpenRouterMessage = {
          role: "system",
          content: tradingVisionSystemPrompt
        };
        const userMessage: OpenRouterMessage = {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "Analise este frame do grafico BTC/crypto. Bloqueie entrada ruim, detecte mercado lateral, destaque risco alto e retorne checklist visual."
            },
            {
              type: "image_url",
              image_url: {
                url: input.dataUrl
              }
            }
          ]
        };
        const messages: OpenRouterMessage[] = [systemMessage, userMessage];

        let parsed: unknown;

        try {
          parsed = await this.client.completeJson({
            apiKey: input.settings.openRouterApiKey,
            model,
            messages,
            responseFormat: openRouterAnalysisResponseFormat,
            maxTokens: 900
          });
        } catch (error) {
          if (!shouldRetryWithoutStructuredOutput(error)) {
            throw error;
          }

          parsed = await this.client.completeJson({
            apiKey: input.settings.openRouterApiKey,
            model,
            messages: [
              {
                role: "system",
                content: `${tradingVisionSystemPrompt}

Retorne somente JSON puro, sem markdown, sem comentarios e sem texto antes ou depois do objeto.
Estrutura obrigatoria:
{
  "signal": "BUY|SELL|WAIT|AVOID",
  "confidence": 0,
  "riskLevel": "LOW|MEDIUM|HIGH",
  "marketCondition": "TRENDING|RANGING|VOLATILE|UNCLEAR",
  "suggestedExpiry": "ONE_MINUTE|TWO_MINUTES|FIVE_MINUTES|NONE",
  "reasoning": "texto curto",
  "checklist": [{ "label": "texto", "passed": true }],
  "warning": "texto curto"
}`
              },
              userMessage
            ],
            maxTokens: 900
          });
        }

        return {
          analysis: aiAnalysisSchema.parse(parsed),
          providerMode: "REAL" as const,
          modelUsed: model
        };
      } catch (error) {
        const reason = error instanceof Error ? error.message : `Falha desconhecida no modelo ${model}.`;
        errorsByModel.push(`${model}: ${reason}`);
        if (!shouldTryNextModel(error)) {
          break;
        }
      }
    }

    return this.unavailableResult(errorsByModel.join(" | ") || "OpenRouter analysis failed.");
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

export class MockAIAnalysisProvider implements AIAnalysisProvider {
  public async analyzeFrame(input: AnalyzeFrameProviderInput) {
    const second = new Date(input.metadata.capturedAt).getSeconds();
    const signal = second % 13 === 0 ? "BUY" : second % 19 === 0 ? "SELL" : "WAIT";
    return {
      analysis: aiAnalysisSchema.parse({
        signal,
        confidence: signal === "WAIT" ? 58 : 76,
        riskLevel: signal === "WAIT" ? "MEDIUM" : "LOW",
        marketCondition: signal === "WAIT" ? "RANGING" : "TRENDING",
        suggestedExpiry: signal === "WAIT" ? "NONE" : "TWO_MINUTES",
        reasoning:
          signal === "WAIT"
            ? "Modo mock: mercado tratado como lateral ou sem confirmacao suficiente."
            : "Modo mock: sinal demonstrativo aprovado para validar o fluxo.",
        checklist: [
          { label: "Tendencia clara", passed: signal !== "WAIT" },
          { label: "Mercado nao lateral", passed: signal !== "WAIT" },
          { label: "Risco alto ausente", passed: true },
          { label: "Confirmacao de candle", passed: signal !== "WAIT" }
        ],
        warning: "Modo mock nao analisa mercado real. Configure provider real."
      }),
      providerMode: "MOCK" as const,
      modelUsed: "mock"
    };
  }
}
