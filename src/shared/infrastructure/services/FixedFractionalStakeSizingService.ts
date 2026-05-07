import type { RiskSettings } from "@shared/domain/entities/Settings";
import type { StakeSizingService } from "@shared/domain/services/StakeSizingService";

export class FixedFractionalStakeSizingService implements StakeSizingService {
  public calculate(settings: RiskSettings): number {
    const rawStake = settings.bankroll * (settings.riskPercent / 100);
    const cappedStake = Math.min(rawStake, settings.maxStake);
    return Math.max(0, Number(cappedStake.toFixed(2)));
  }
}
