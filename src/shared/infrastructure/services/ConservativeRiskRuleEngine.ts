import type { AnalysisDecision, Signal, SuggestedExpiry } from "@shared/domain/entities/Analysis";
import type { RiskRuleEngine, RiskRuleInput } from "@shared/domain/services/RiskRuleEngine";

const actionableSignals: Signal[] = ["BUY", "SELL"];

export class ConservativeRiskRuleEngine implements RiskRuleEngine {
  public evaluate(input: RiskRuleInput): AnalysisDecision {
    const reasons: string[] = [];
    let finalSignal = input.ai.signal;
    let finalExpiry = input.ai.suggestedExpiry;

    if (input.ai.riskLevel === "HIGH") {
      finalSignal = "AVOID";
      finalExpiry = "NONE";
      reasons.push("Risco alto detectado; entrada bloqueada.");
    }

    if (input.ai.marketCondition === "UNCLEAR") {
      finalSignal = "WAIT";
      finalExpiry = "NONE";
      reasons.push("Mercado sem leitura clara; aguardar.");
    }

    if (input.ai.confidence < input.settings.minConfidence) {
      finalSignal = "WAIT";
      finalExpiry = "NONE";
      reasons.push(`Confiança abaixo do mínimo (${input.ai.confidence}% < ${input.settings.minConfidence}%).`);
    }

    if (input.isStale) {
      finalSignal = finalSignal === "AVOID" ? "AVOID" : "WAIT";
      finalExpiry = "NONE";
      reasons.push("Sinal atrasado; não emitir entrada.");
    }

    if (input.ai.marketCondition === "VOLATILE" && input.ai.confidence < 82) {
      finalSignal = "AVOID";
      finalExpiry = "NONE";
      reasons.push("Volatilidade alta sem confiança excepcional.");
    }

    if (finalExpiry === "ONE_MINUTE" && input.latencyMs > input.settings.maxOneMinuteLatencyMs) {
      finalExpiry = "TWO_MINUTES";
      reasons.push("Latência alta para 1m; expiração elevada para 2m.");
    }

    if (!input.settings.enabledExpiries.includes(finalExpiry)) {
      finalExpiry = this.pickFallbackExpiry(input.settings.enabledExpiries);
      reasons.push("Expiração ajustada para uma opção habilitada.");
    }

    if (!actionableSignals.includes(finalSignal)) {
      finalExpiry = "NONE";
    }

    const shouldAlert = this.shouldAlert(finalSignal, input, reasons);

    if (reasons.length === 0) {
      reasons.push("Sinal mantido após validação local.");
    }

    return {
      originalSignal: input.ai.signal,
      finalSignal,
      finalExpiry,
      suggestedStake: 0,
      ruleReasons: reasons,
      shouldAlert
    };
  }

  private pickFallbackExpiry(enabled: SuggestedExpiry[]): SuggestedExpiry {
    if (enabled.includes("TWO_MINUTES")) return "TWO_MINUTES";
    if (enabled.includes("FIVE_MINUTES")) return "FIVE_MINUTES";
    if (enabled.includes("ONE_MINUTE")) return "ONE_MINUTE";
    return "NONE";
  }

  private shouldAlert(finalSignal: Signal, input: RiskRuleInput, reasons: string[]): boolean {
    if (!actionableSignals.includes(finalSignal)) return false;
    if (input.ai.riskLevel === "HIGH") return false;
    if (input.ai.marketCondition === "UNCLEAR") return false;
    if (input.ai.confidence < input.settings.minConfidence) return false;
    if (input.isStale) return false;

    const lastAlertAt = input.lastAlertAtBySignal?.[finalSignal as "BUY" | "SELL"];
    if (!lastAlertAt) return true;

    const elapsedMs = Date.now() - new Date(lastAlertAt).getTime();
    if (elapsedMs < input.settings.alertCooldownMs) {
      reasons.push("Alerta bloqueado por cooldown para evitar repetição.");
      return false;
    }

    return true;
  }
}
