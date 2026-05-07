import type { RiskSettings } from "../entities/Settings";

export interface StakeSizingService {
  calculate(settings: RiskSettings): number;
}
