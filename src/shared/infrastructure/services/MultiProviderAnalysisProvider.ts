import type { AIAnalysisProvider, AnalyzeFrameProviderInput } from "@shared/domain/services/AIAnalysisProvider";
import { GeminiVisionProvider } from "@shared/infrastructure/google/GeminiVisionProvider";
import { OpenRouterVisionProvider } from "@shared/infrastructure/openrouter/OpenRouterVisionProvider";

export class MultiProviderAnalysisProvider implements AIAnalysisProvider {
  private readonly openRouterProvider = new OpenRouterVisionProvider();
  private readonly googleProvider = new GeminiVisionProvider();

  public analyzeFrame(input: AnalyzeFrameProviderInput) {
    if (input.settings.provider === "GOOGLE") {
      return this.googleProvider.analyzeFrame(input);
    }
    return this.openRouterProvider.analyzeFrame(input);
  }
}
