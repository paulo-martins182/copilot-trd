import type { AnalysisDecision, Signal, SuggestedExpiry } from "@shared/domain/entities/Analysis";
import type { RiskRuleEngine, RiskRuleInput } from "@shared/domain/services/RiskRuleEngine";

const actionableSignals: Signal[] = ["BUY", "SELL"];

export class ContextAwareRiskEngine implements RiskRuleEngine {
  public evaluate(input: RiskRuleInput): AnalysisDecision {
    const reasons: string[] = [];
    const blockedBy: string[] = [];
    let finalSignal = input.ai.signal;
    let finalExpiry = input.ai.suggestedExpiry;
    let empiricalWinRate = input.performance.empiricalWinRate;
    const consensusScore = Number(
      (
        input.consensus.stabilityScore * 0.45 +
        input.consensus.directionAgreement * 0.35 +
        Math.min(1, input.ai.confidence / 100) * 0.2
      ).toFixed(2)
    );
    let macroContextApplied = false;

    if (input.providerMode !== "REAL" && input.settings.requireRealProvider) {
      finalSignal = "WAIT";
      finalExpiry = "NONE";
      blockedBy.push("provider_mode");
      reasons.push("Provider real indisponivel; sinais operacionais bloqueados.");
    }
    if (input.ai.riskLevel === "HIGH") {
      finalSignal = "AVOID";
      finalExpiry = "NONE";
      blockedBy.push("risk_high");
      reasons.push("Risco alto detectado; entrada bloqueada.");
    }
    if (input.ai.marketCondition === "UNCLEAR" || input.ai.marketCondition === "RANGING") {
      finalSignal = "WAIT";
      finalExpiry = "NONE";
      blockedBy.push("market_state");
      reasons.push("Mercado lateral ou sem leitura clara; aguardar.");
    }
    if (input.ai.confidence < input.settings.minConfidence) {
      finalSignal = "WAIT";
      finalExpiry = "NONE";
      blockedBy.push("low_confidence");
      reasons.push(`Confianca abaixo do minimo (${input.ai.confidence}% < ${input.settings.minConfidence}%).`);
    }
    if (input.isStale) {
      finalSignal = "WAIT";
      finalExpiry = "NONE";
      blockedBy.push("stale_signal");
      reasons.push("Sinal atrasado; nao emitir entrada.");
    }
    if (input.consensus.flipCount > 0) {
      finalSignal = "WAIT";
      finalExpiry = "NONE";
      blockedBy.push("flip_detected");
      reasons.push("Direcao alternando em sequencia curta; leitura instavel.");
    }
    if (input.consensus.rangeLikelihood >= 0.45) {
      finalSignal = "WAIT";
      finalExpiry = "NONE";
      blockedBy.push("range_likelihood");
      reasons.push("Probabilidade elevada de lateralizacao.");
    }
    if (input.consensus.volatilitySpike) {
      finalSignal = "AVOID";
      finalExpiry = "NONE";
      blockedBy.push("volatility_spike");
      reasons.push("Spike de volatilidade detectado no consenso temporal.");
    }
    if (consensusScore < input.settings.minConsensusScore) {
      finalSignal = "WAIT";
      finalExpiry = "NONE";
      blockedBy.push("consensus_low");
      reasons.push("Consenso temporal insuficiente para alerta de alta precisao.");
    }

    if (input.marketContext) {
      macroContextApplied = true;
      if (input.marketContext.riskState === "HIGH") {
        finalSignal = "AVOID";
        finalExpiry = "NONE";
        blockedBy.push("macro_risk_high");
        reasons.push("Contexto diario indica risco macro alto.");
      } else if (input.marketContext.volatilityWarning) {
        finalSignal = "WAIT";
        finalExpiry = "NONE";
        blockedBy.push("macro_volatility");
        reasons.push("Contexto diario indica volatilidade elevada.");
      } else if (input.marketContext.marketBias === "MIXED" || input.marketContext.marketBias === "NEUTRAL") {
        empiricalWinRate = Math.max(0, empiricalWinRate - 5);
        reasons.push("Contexto macro neutro/misto reduziu a confianca calibrada.");
      } else if (
        (input.marketContext.marketBias === "BULLISH" && input.ai.signal === "BUY") ||
        (input.marketContext.marketBias === "BEARISH" && input.ai.signal === "SELL")
      ) {
        empiricalWinRate = Math.min(100, empiricalWinRate + 4);
        reasons.push("Contexto macro alinhado reforcou moderadamente a confianca calibrada.");
      }
    }

    if (input.performance.total < input.settings.minSampleSupport) {
      finalSignal = "WAIT";
      finalExpiry = "NONE";
      blockedBy.push("sample_support");
      reasons.push("Setup sem suporte historico suficiente; manter shadow mode.");
    }
    if (empiricalWinRate < input.settings.minEmpiricalWinRate) {
      finalSignal = "WAIT";
      finalExpiry = "NONE";
      blockedBy.push("empirical_win_rate");
      reasons.push("Taxa empirica do setup abaixo do threshold de alta precisao.");
    }

    if (finalExpiry === "ONE_MINUTE" || finalExpiry === "FIVE_MINUTES") {
      finalExpiry = "TWO_MINUTES";
      reasons.push("Expiracao normalizada para 2 minutos no modo BTC.");
    }
    if (!input.settings.enabledExpiries.includes(finalExpiry)) {
      finalExpiry = this.pickFallbackExpiry(input.settings.enabledExpiries);
      reasons.push("Expiracao ajustada para configuracao habilitada.");
    }
    if (!actionableSignals.includes(finalSignal)) {
      finalExpiry = "NONE";
    }

    return {
      originalSignal: input.ai.signal,
      finalSignal,
      finalExpiry,
      suggestedStake: 0,
      ruleReasons: reasons.length > 0 ? reasons : ["Sinal manteve todos os filtros de alta precisao."],
      shouldAlert: this.shouldAlert(finalSignal, input, blockedBy),
      providerMode: input.providerMode,
      consensusScore,
      empiricalWinRate: Number(empiricalWinRate.toFixed(2)),
      sampleSupport: input.performance.total,
      macroContextApplied,
      blockedBy
    };
  }

  private pickFallbackExpiry(enabled: SuggestedExpiry[]): SuggestedExpiry {
    if (enabled.includes("TWO_MINUTES")) return "TWO_MINUTES";
    if (enabled.includes("ONE_MINUTE")) return "ONE_MINUTE";
    if (enabled.includes("FIVE_MINUTES")) return "FIVE_MINUTES";
    return "NONE";
  }

  private shouldAlert(finalSignal: Signal, input: RiskRuleInput, blockedBy: string[]): boolean {
    if (!actionableSignals.includes(finalSignal)) return false;
    if (blockedBy.length > 0) return false;
    const lastAlertAt = input.lastAlertAtBySignal?.[finalSignal as "BUY" | "SELL"];
    if (!lastAlertAt) return true;
    return Date.now() - new Date(lastAlertAt).getTime() >= input.settings.alertCooldownMs;
  }
}
