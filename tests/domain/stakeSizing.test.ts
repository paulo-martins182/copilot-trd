import { describe, expect, it } from "vitest";
import { defaultRiskSettings } from "@shared/domain/entities/Settings";
import { FixedFractionalStakeSizingService } from "@shared/infrastructure/services/FixedFractionalStakeSizingService";

describe("FixedFractionalStakeSizingService", () => {
  const service = new FixedFractionalStakeSizingService();

  it("calcula percentual da banca", () => {
    expect(service.calculate({ ...defaultRiskSettings, bankroll: 1000, riskPercent: 1, maxStake: 50 })).toBe(10);
  });

  it("respeita valor máximo", () => {
    expect(service.calculate({ ...defaultRiskSettings, bankroll: 10000, riskPercent: 2, maxStake: 75 })).toBe(75);
  });

  it("nunca retorna valor negativo", () => {
    expect(service.calculate({ ...defaultRiskSettings, bankroll: 0, riskPercent: 1, maxStake: 50 })).toBe(0);
  });
});
