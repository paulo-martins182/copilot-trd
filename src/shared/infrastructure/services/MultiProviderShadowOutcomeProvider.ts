import type { ShadowOutcomeProvider } from "@shared/domain/services/ShadowOutcomeProvider";
import { GeminiShadowOutcomeProvider } from "@shared/infrastructure/google/GeminiShadowOutcomeProvider";
import { OpenRouterShadowOutcomeProvider } from "./OpenRouterShadowOutcomeProvider";

export class MultiProviderShadowOutcomeProvider implements ShadowOutcomeProvider {
  private readonly openRouterProvider = new OpenRouterShadowOutcomeProvider();
  private readonly googleProvider = new GeminiShadowOutcomeProvider();

  public evaluate(input: Parameters<ShadowOutcomeProvider["evaluate"]>[0]) {
    if (input.settings.provider === "GOOGLE") {
      return this.googleProvider.evaluate(input);
    }
    return this.openRouterProvider.evaluate(input);
  }
}
