import type { AnalysisRepository } from "@shared/domain/repositories/AnalysisRepository";
import type { AIAnalysisProvider } from "@shared/domain/services/AIAnalysisProvider";
import type { RiskRuleEngine } from "@shared/domain/services/RiskRuleEngine";
import type { StakeSizingService } from "@shared/domain/services/StakeSizingService";
import type { AnalysisRecord, FrameMetadata } from "@shared/domain/entities/Analysis";
import type { AppSettings } from "@shared/domain/entities/Settings";

export interface AnalyzeFrameUseCaseInput {
  dataUrl: string;
  metadata: FrameMetadata;
  settings: AppSettings;
  snapshotPath: string;
  lastAlertAtBySignal?: Partial<Record<"BUY" | "SELL", string>> | undefined;
}

export class AnalyzeFrameUseCase {
  public constructor(
    private readonly provider: AIAnalysisProvider,
    private readonly ruleEngine: RiskRuleEngine,
    private readonly stakeSizing: StakeSizingService,
    private readonly repository: AnalysisRepository
  ) {}

  public async execute(input: AnalyzeFrameUseCaseInput): Promise<AnalysisRecord> {
    const startedAt = Date.now();
    const ai = await this.provider.analyzeFrame({
      dataUrl: input.dataUrl,
      metadata: input.metadata,
      settings: input.settings.openrouter
    });
    const analyzedAtDate = new Date();
    const capturedAtMs = new Date(input.metadata.capturedAt).getTime();
    const latencyMs = Math.max(0, analyzedAtDate.getTime() - capturedAtMs);
    const isStale = latencyMs > input.settings.risk.staleAfterMs;
    const decision = this.ruleEngine.evaluate({
      ai,
      latencyMs,
      isStale,
      settings: input.settings.risk,
      lastAlertAtBySignal: input.lastAlertAtBySignal
    });

    const record: AnalysisRecord = {
      id: crypto.randomUUID(),
      createdAt: new Date(startedAt).toISOString(),
      sourceType: input.metadata.sourceType,
      sourceId: input.metadata.sourceId,
      capturedAt: input.metadata.capturedAt,
      analyzedAt: analyzedAtDate.toISOString(),
      latencyMs,
      isStale,
      snapshotPath: input.snapshotPath,
      ai,
      decision: {
        ...decision,
        suggestedStake: this.stakeSizing.calculate(input.settings.risk)
      }
    };

    await this.repository.save(record);
    return record;
  }
}
