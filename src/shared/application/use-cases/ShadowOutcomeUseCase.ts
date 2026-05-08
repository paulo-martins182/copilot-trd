import { readFile } from "node:fs/promises";
import type { MarketContextRepository } from "@shared/domain/repositories/MarketContextRepository";
import type { ShadowOutcomeProvider } from "@shared/domain/services/ShadowOutcomeProvider";
import type { AISettings } from "@shared/domain/entities/Settings";

export class ShadowOutcomeUseCase {
  public constructor(
    private readonly repository: MarketContextRepository,
    private readonly provider: ShadowOutcomeProvider
  ) {}

  public async settleMaturePredictions(input: {
    sourceId: string;
    currentDataUrl: string;
    nowIso: string;
    settings: AISettings;
  }) {
    const predictions = await this.repository.getMaturePendingPredictions(input.nowIso, input.sourceId);
    for (const prediction of predictions) {
      const baselineBytes = await readFile(prediction.snapshotPath);
      const baselineDataUrl = `data:image/png;base64,${baselineBytes.toString("base64")}`;
      const result = await this.provider.evaluate({
        baselineDataUrl,
        currentDataUrl: input.currentDataUrl,
        expectedSignal: prediction.expectedSignal,
        settings: input.settings
      });
      await this.repository.settleShadowPrediction(
        prediction.id,
        result.outcome,
        input.nowIso,
        result.reason
      );
    }
  }
}
