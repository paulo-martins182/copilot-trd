import { describe, expect, it } from "vitest";
import type { AIAnalysis } from "@shared/domain/entities/Analysis";
import { defaultRiskSettings } from "@shared/domain/entities/Settings";
import { ContextAwareRiskEngine } from "@shared/infrastructure/services/ContextAwareRiskEngine";

const baseAnalysis: AIAnalysis = {
  signal: "BUY",
  confidence: 86,
  riskLevel: "LOW",
  marketCondition: "TRENDING",
  suggestedExpiry: "TWO_MINUTES",
  reasoning: "Contexto visual favoravel.",
  checklist: [{ label: "Tendencia clara", passed: true }],
  warning: "Risco permanece sob responsabilidade do usuario."
};

function baseInput() {
  return {
    ai: baseAnalysis,
    latencyMs: 400,
    isStale: false,
    settings: {
      ...defaultRiskSettings,
      minSampleSupport: 3,
      minEmpiricalWinRate: 80
    },
    providerMode: "REAL" as const,
    marketContext: null,
    consensus: {
      dominantSignal: "BUY" as const,
      directionAgreement: 1,
      confidenceMean: 86,
      flipCount: 0,
      stabilityScore: 1,
      rangeLikelihood: 0,
      volatilitySpike: false
    },
    performance: {
      setupLabel: "BTC|BUY|TRENDING|LOW",
      total: 5,
      wins: 4,
      losses: 1,
      unclear: 0,
      empiricalWinRate: 80
    }
  };
}

describe("ContextAwareRiskEngine", () => {
  const engine = new ContextAwareRiskEngine();

  it("bloqueia provider indisponivel", () => {
    const decision = engine.evaluate({
      ...baseInput(),
      providerMode: "REAL_PROVIDER_UNAVAILABLE"
    });
    expect(decision.finalSignal).toBe("WAIT");
    expect(decision.blockedBy).toContain("provider_mode");
  });

  it("bloqueia lateralizacao", () => {
    const decision = engine.evaluate({
      ...baseInput(),
      ai: { ...baseAnalysis, marketCondition: "RANGING" }
    });
    expect(decision.finalSignal).toBe("WAIT");
  });

  it("bloqueia por consenso baixo", () => {
    const decision = engine.evaluate({
      ...baseInput(),
      consensus: {
        ...baseInput().consensus,
        directionAgreement: 0.4,
        stabilityScore: 0.35
      }
    });
    expect(decision.finalSignal).toBe("WAIT");
    expect(decision.blockedBy).toContain("consensus_low");
  });

  it("bloqueia por risco macro alto", () => {
    const decision = engine.evaluate({
      ...baseInput(),
      marketContext: {
        id: "ctx",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1000).toISOString(),
        marketBias: "BEARISH",
        riskState: "HIGH",
        volatilityWarning: false,
        majorEvents: ["Macro shock"],
        analysisImpact: "Risco alto",
        headlines: [],
        providerMode: "REAL"
      }
    });
    expect(decision.finalSignal).toBe("AVOID");
    expect(decision.blockedBy).toContain("macro_risk_high");
  });

  it("nao alerta sem suporte historico", () => {
    const decision = engine.evaluate({
      ...baseInput(),
      performance: {
        ...baseInput().performance,
        total: 1,
        empiricalWinRate: 100
      }
    });
    expect(decision.shouldAlert).toBe(false);
    expect(decision.blockedBy).toContain("sample_support");
  });
});
