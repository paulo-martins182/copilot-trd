import type { AIAnalysisProvider, AnalyzeFrameProviderInput } from "@shared/domain/services/AIAnalysisProvider";
import { aiAnalysisSchema } from "@shared/presentation/dtos/schemas";

export class RealOnlyAnalysisProvider implements AIAnalysisProvider {
  public async analyzeFrame(_input: AnalyzeFrameProviderInput) {
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
        warning: "Configure uma API key valida e desative o modo mock para operar em modo real."
      }),
      providerMode: "REAL_PROVIDER_UNAVAILABLE" as const,
      modelUsed: "unavailable"
    };
  }
}
