import type { AIAnalysisProvider, AnalyzeFrameProviderInput } from "@shared/domain/services/AIAnalysisProvider";
import { aiAnalysisSchema } from "@shared/presentation/dtos/schemas";
import { tradingVisionSystemPrompt } from "../ai/tradingVisionPrompt";
import { openRouterAnalysisResponseFormat } from "./openRouterAnalysisJsonSchema";

interface OpenRouterChatResponse {
  model?: string;
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
  error?: {
    message?: string;
  };
}

type OpenRouterMessageContent = string | Array<{ type?: string; text?: string }> | undefined;

export class OpenRouterVisionProvider implements AIAnalysisProvider {
  public async analyzeFrame(input: AnalyzeFrameProviderInput) {
    if (input.settings.useMockProvider || !input.settings.apiKey) {
      return new MockAIAnalysisProvider().analyzeFrame(input);
    }

    const primaryModel = input.settings.model || "google/gemma-4-31b-it:free";
    const fallbackModel = input.settings.fallbackModel || "openrouter/free";
    const modelsToTry = primaryModel === fallbackModel ? [primaryModel] : [primaryModel, fallbackModel];
    let lastError: unknown;

    for (const model of modelsToTry) {
      try {
        return await this.requestAnalysis(input, model);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError instanceof Error ? lastError : new Error("OpenRouter analysis failed.");
  }

  private async requestAnalysis(input: AnalyzeFrameProviderInput, model: string) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.settings.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://tradescope-ai.local",
        "X-Title": "TradeScope AI"
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: tradingVisionSystemPrompt
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  "Analise este frame do gráfico. Bloqueie entrada ruim, detecte mercado lateral, destaque risco alto e retorne checklist visual."
              },
              {
                type: "image_url",
                image_url: {
                  url: input.dataUrl
                }
              }
            ]
          }
        ],
        response_format: openRouterAnalysisResponseFormat,
        provider: {
          require_parameters: true
        },
        temperature: 0.1,
        max_tokens: 900,
        stream: false
      })
    });

    const payload = (await response.json()) as OpenRouterChatResponse;
    if (!response.ok) {
      throw new Error(payload.error?.message ?? `OpenRouter request failed with status ${response.status}.`);
    }

    const content = payload.choices?.[0]?.message?.content;
    const text = this.extractText(content);
    const parsed = JSON.parse(text);
    return aiAnalysisSchema.parse(parsed);
  }

  private extractText(content: OpenRouterMessageContent): string {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
      return content
        .map((part: { type?: string; text?: string }) => (part.type === "text" ? part.text : ""))
        .filter(Boolean)
        .join("");
    }
    throw new Error("OpenRouter response did not include text content.");
  }
}

export class MockAIAnalysisProvider implements AIAnalysisProvider {
  public async analyzeFrame(input: AnalyzeFrameProviderInput) {
    const second = new Date(input.metadata.capturedAt).getSeconds();
    const signal = second % 13 === 0 ? "BUY" : second % 19 === 0 ? "SELL" : "WAIT";
    return aiAnalysisSchema.parse({
      signal,
      confidence: signal === "WAIT" ? 58 : 76,
      riskLevel: signal === "WAIT" ? "MEDIUM" : "LOW",
      marketCondition: signal === "WAIT" ? "RANGING" : "TRENDING",
      suggestedExpiry: signal === "WAIT" ? "NONE" : "TWO_MINUTES",
      reasoning:
        signal === "WAIT"
          ? "Modo mock: mercado tratado como lateral ou sem confirmação suficiente."
          : "Modo mock: sinal demonstrativo aprovado para validar toast e alerta.",
      checklist: [
        { label: "Tendência clara", passed: signal !== "WAIT" },
        { label: "Mercado não lateral", passed: signal !== "WAIT" },
        { label: "Risco alto ausente", passed: true },
        { label: "Confirmação de candle", passed: signal !== "WAIT" }
      ],
      warning: "Modo mock não analisa mercado real. Configure OpenRouter para visão real."
    });
  }
}
