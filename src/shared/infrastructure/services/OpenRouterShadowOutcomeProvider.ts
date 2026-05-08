import type { AISettings } from "@shared/domain/entities/Settings";
import type { ShadowOutcomeProvider } from "@shared/domain/services/ShadowOutcomeProvider";
import { OpenRouterClient } from "@shared/infrastructure/openrouter/OpenRouterClient";
import { openRouterShadowOutcomeJsonSchema } from "@shared/infrastructure/openrouter/openRouterShadowOutcomeJsonSchema";

type OpenRouterMessage = Record<string, unknown>;

function shouldRetryWithoutStructuredOutput(error: unknown) {
  return (
    error instanceof Error &&
    /No endpoints found that can handle the requested parameters|response_format|provider routing|structured/i.test(
      error.message
    )
  );
}

export class OpenRouterShadowOutcomeProvider implements ShadowOutcomeProvider {
  private readonly client = new OpenRouterClient();

  public async evaluate(input: {
    baselineDataUrl: string;
    currentDataUrl: string;
    expectedSignal: "BUY" | "SELL";
    settings: AISettings;
  }) {
    if (!input.settings.openRouterApiKey || input.settings.useMockProvider) {
      return {
        outcome: "UNCLEAR" as const,
        reason: "Provider real indisponivel para validar outcome."
      };
    }

    const systemMessage: OpenRouterMessage = {
      role: "system",
      content:
        "Compare dois frames do mesmo grafico BTC separados por 2 minutos. Determine se o preco final ficou maior ou menor do que no frame inicial para validar uma previsao BUY/SELL."
    };
    const userMessage: OpenRouterMessage = {
      role: "user",
      content: [
        {
          type: "text",
          text: `Predicao esperada: ${input.expectedSignal}. Imagem 1 = inicio. Imagem 2 = fim.`
        },
        {
          type: "image_url",
          image_url: { url: input.baselineDataUrl }
        },
        {
          type: "image_url",
          image_url: { url: input.currentDataUrl }
        }
      ]
    };
    const messages: OpenRouterMessage[] = [systemMessage, userMessage];

    let parsed: unknown;

    try {
      parsed = await this.client.completeJson({
        apiKey: input.settings.openRouterApiKey,
        model: input.settings.model,
        messages,
        responseFormat: openRouterShadowOutcomeJsonSchema,
        maxTokens: 350
      });
    } catch (error) {
      if (!shouldRetryWithoutStructuredOutput(error)) {
        throw error;
      }

      parsed = await this.client.completeJson({
        apiKey: input.settings.openRouterApiKey,
        model: input.settings.model,
        messages: [
          {
            role: "system",
            content: `${String(systemMessage.content)}

Retorne somente JSON puro com:
{ "outcome": "WIN|LOSS|UNCLEAR", "reason": "texto curto" }`
          },
          userMessage
        ],
        maxTokens: 350
      });
    }

    return parsed as {
      outcome: "WIN" | "LOSS" | "UNCLEAR";
      reason: string;
    };
  }
}
