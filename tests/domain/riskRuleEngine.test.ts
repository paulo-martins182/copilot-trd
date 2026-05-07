import { describe, expect, it } from "vitest";
import type { AIAnalysis } from "@shared/domain/entities/Analysis";
import { defaultRiskSettings } from "@shared/domain/entities/Settings";
import { ConservativeRiskRuleEngine } from "@shared/infrastructure/services/ConservativeRiskRuleEngine";

const baseAnalysis: AIAnalysis = {
  signal: "BUY",
  confidence: 78,
  riskLevel: "LOW",
  marketCondition: "TRENDING",
  suggestedExpiry: "ONE_MINUTE",
  reasoning: "Contexto visual favorável.",
  checklist: [{ label: "Tendência clara", passed: true }],
  warning: "Risco permanece sob responsabilidade do usuário."
};

describe("ConservativeRiskRuleEngine", () => {
  const engine = new ConservativeRiskRuleEngine();

  it("rebaixa baixa confiança para WAIT", () => {
    const decision = engine.evaluate({
      ai: { ...baseAnalysis, confidence: 50 },
      latencyMs: 400,
      isStale: false,
      settings: defaultRiskSettings
    });

    expect(decision.finalSignal).toBe("WAIT");
    expect(decision.shouldAlert).toBe(false);
  });

  it("bloqueia risco alto como AVOID", () => {
    const decision = engine.evaluate({
      ai: { ...baseAnalysis, riskLevel: "HIGH" },
      latencyMs: 400,
      isStale: false,
      settings: defaultRiskSettings
    });

    expect(decision.finalSignal).toBe("AVOID");
    expect(decision.finalExpiry).toBe("NONE");
  });

  it("rebaixa mercado incerto para WAIT", () => {
    const decision = engine.evaluate({
      ai: { ...baseAnalysis, marketCondition: "UNCLEAR" },
      latencyMs: 400,
      isStale: false,
      settings: defaultRiskSettings
    });

    expect(decision.finalSignal).toBe("WAIT");
  });

  it("não permite 1m com latência alta", () => {
    const decision = engine.evaluate({
      ai: baseAnalysis,
      latencyMs: defaultRiskSettings.maxOneMinuteLatencyMs + 1,
      isStale: false,
      settings: defaultRiskSettings
    });

    expect(decision.finalSignal).toBe("BUY");
    expect(decision.finalExpiry).toBe("TWO_MINUTES");
  });

  it("bloqueia sinal stale", () => {
    const decision = engine.evaluate({
      ai: baseAnalysis,
      latencyMs: 3000,
      isStale: true,
      settings: defaultRiskSettings
    });

    expect(decision.finalSignal).toBe("WAIT");
    expect(decision.shouldAlert).toBe(false);
  });
});
