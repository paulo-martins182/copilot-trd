import { app, safeStorage } from "electron";
import { join } from "node:path";
import { BrowserWorkspace } from "@main/electron/BrowserWorkspace";
import { DesktopCaptureProvider } from "@main/capture/DesktopCaptureProvider";
import { SnapshotStorage } from "@main/capture/SnapshotStorage";
import { AnalyzeFrameUseCase } from "@shared/application/use-cases/AnalyzeFrameUseCase";
import { ManageSettingsUseCase } from "@shared/application/use-cases/ManageSettingsUseCase";
import { TradeJournalUseCase } from "@shared/application/use-cases/TradeJournalUseCase";
import { SqliteDatabase } from "@shared/infrastructure/database/SqliteDatabase";
import { OpenRouterVisionProvider } from "@shared/infrastructure/openrouter/OpenRouterVisionProvider";
import { SqliteAnalysisRepository } from "@shared/infrastructure/repositories/SqliteAnalysisRepository";
import { SqliteSettingsRepository } from "@shared/infrastructure/repositories/SqliteSettingsRepository";
import { SqliteTradeJournalRepository } from "@shared/infrastructure/repositories/SqliteTradeJournalRepository";
import { ConservativeRiskRuleEngine } from "@shared/infrastructure/services/ConservativeRiskRuleEngine";
import { FixedFractionalStakeSizingService } from "@shared/infrastructure/services/FixedFractionalStakeSizingService";

export async function createAppContainer() {
  const userDataPath = app.getPath("userData");
  const database = await SqliteDatabase.create(join(userDataPath, "tradescope-ai.sqlite"));
  const analysisRepository = new SqliteAnalysisRepository(database);
  const settingsRepository = new SqliteSettingsRepository(database, safeStorage);
  const tradeJournalRepository = new SqliteTradeJournalRepository(database);
  const settingsUseCase = new ManageSettingsUseCase(settingsRepository);
  const analyzeFrameUseCase = new AnalyzeFrameUseCase(
    new OpenRouterVisionProvider(),
    new ConservativeRiskRuleEngine(),
    new FixedFractionalStakeSizingService(),
    analysisRepository
  );

  return {
    browserWorkspace: new BrowserWorkspace(),
    desktopCaptureProvider: new DesktopCaptureProvider(),
    snapshotStorage: new SnapshotStorage(userDataPath),
    analyzeFrameUseCase,
    settingsUseCase,
    tradeJournalUseCase: new TradeJournalUseCase(tradeJournalRepository),
    analysisRepository
  };
}
