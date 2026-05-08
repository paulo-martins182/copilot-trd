import type { AnalysisRepository } from "@shared/domain/repositories/AnalysisRepository";
import type { MarketContextRepository } from "@shared/domain/repositories/MarketContextRepository";
import type { AIAnalysisProvider } from "@shared/domain/services/AIAnalysisProvider";
import type { RiskRuleEngine } from "@shared/domain/services/RiskRuleEngine";
import type { StakeSizingService } from "@shared/domain/services/StakeSizingService";
import type { TemporalConsensusEngine } from "@shared/domain/services/TemporalConsensusEngine";
import type { AnalysisRecord, FrameMetadata } from "@shared/domain/entities/Analysis";
import type { AppSettings } from "@shared/domain/entities/Settings";
import type { ShadowOutcomeUseCase } from "./ShadowOutcomeUseCase";

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
    private readonly repository: AnalysisRepository,
    private readonly marketContextRepository: MarketContextRepository,
    private readonly consensusEngine: TemporalConsensusEngine,
    private readonly shadowOutcomeUseCase: ShadowOutcomeUseCase
  ) {}

  public async execute(input: AnalyzeFrameUseCaseInput): Promise<AnalysisRecord> {
    const startedAt = Date.now();
    const providerResult = await this.provider.analyzeFrame({
      dataUrl: input.dataUrl,
      metadata: input.metadata,
      settings: input.settings.ai
    });
    await this.shadowOutcomeUseCase.settleMaturePredictions({
      sourceId: input.metadata.sourceId,
      currentDataUrl: input.dataUrl,
      nowIso: new Date().toISOString(),
      settings: input.settings.ai
    });
    const analyzedAtDate = new Date();
    const capturedAtMs = new Date(input.metadata.capturedAt).getTime();
    const latencyMs = Math.max(0, analyzedAtDate.getTime() - capturedAtMs);
    const isStale = latencyMs > input.settings.risk.staleAfterMs;
    const setupLabel = `${input.settings.browser.targetAsset}|${providerResult.analysis.signal}|${providerResult.analysis.marketCondition}|${providerResult.analysis.riskLevel}`;
    const provisionalRecord: AnalysisRecord = {
      id: crypto.randomUUID(),
      createdAt: new Date(startedAt).toISOString(),
      sourceType: input.metadata.sourceType,
      sourceId: input.metadata.sourceId,
      capturedAt: input.metadata.capturedAt,
      analyzedAt: analyzedAtDate.toISOString(),
      latencyMs,
      isStale,
      snapshotPath: input.snapshotPath,
      ai: providerResult.analysis,
      decision: {
        originalSignal: providerResult.analysis.signal,
        finalSignal: "WAIT",
        finalExpiry: "NONE",
        suggestedStake: 0,
        ruleReasons: [],
        shouldAlert: false,
        providerMode: providerResult.providerMode,
        consensusScore: 0,
        empiricalWinRate: 0,
        sampleSupport: 0,
        macroContextApplied: false,
        blockedBy: []
      },
      setupLabel
    };
    const consensus = this.consensusEngine.observe(provisionalRecord, input.settings.risk.consensusWindowSize);
    const marketContext = await this.marketContextRepository.getLatestContext();
    const performance = await this.marketContextRepository.getSetupPerformance(setupLabel);
    const decision = this.ruleEngine.evaluate({
      ai: providerResult.analysis,
      latencyMs,
      isStale,
      settings: input.settings.risk,
      providerMode: providerResult.providerMode,
      marketContext,
      consensus,
      performance,
      lastAlertAtBySignal: input.lastAlertAtBySignal
    });

    const record: AnalysisRecord = {
      ...provisionalRecord,
      decision: {
        ...decision,
        suggestedStake: this.stakeSizing.calculate(input.settings.risk)
      },
      setupLabel
    };

    await this.repository.save(record);
    if (record.decision.finalSignal === "BUY" || record.decision.finalSignal === "SELL") {
      await this.marketContextRepository.createShadowPrediction({
        id: crypto.randomUUID(),
        analysisId: record.id,
        sourceId: record.sourceId,
        regionJson: JSON.stringify(input.metadata.region),
        expectedSignal: record.decision.finalSignal,
        setupLabel,
        snapshotPath: record.snapshotPath,
        createdAt: record.createdAt,
        settleAfter: new Date(new Date(record.capturedAt).getTime() + 2 * 60 * 1000).toISOString()
      });
    }
    return record;
  }
}
