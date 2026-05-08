import { app, safeStorage } from "electron";
import { join } from "node:path";
import { BrowserWorkspace } from "@main/electron/BrowserWorkspace";
import { DesktopCaptureProvider } from "@main/capture/DesktopCaptureProvider";
import { SnapshotStorage } from "@main/capture/SnapshotStorage";
import { AnalyzeFrameUseCase } from "@shared/application/use-cases/AnalyzeFrameUseCase";
import { ManageSettingsUseCase } from "@shared/application/use-cases/ManageSettingsUseCase";
import { RefreshMarketContextUseCase } from "@shared/application/use-cases/RefreshMarketContextUseCase";
import { ShadowOutcomeUseCase } from "@shared/application/use-cases/ShadowOutcomeUseCase";
import { TradeJournalUseCase } from "@shared/application/use-cases/TradeJournalUseCase";
import { SqliteDatabase } from "@shared/infrastructure/database/SqliteDatabase";
import { SqliteAnalysisRepository } from "@shared/infrastructure/repositories/SqliteAnalysisRepository";
import { SqliteMarketContextRepository } from "@shared/infrastructure/repositories/SqliteMarketContextRepository";
import { SqliteSettingsRepository } from "@shared/infrastructure/repositories/SqliteSettingsRepository";
import { SqliteTradeJournalRepository } from "@shared/infrastructure/repositories/SqliteTradeJournalRepository";
import { ContextAwareRiskEngine } from "@shared/infrastructure/services/ContextAwareRiskEngine";
import { FixedFractionalStakeSizingService } from "@shared/infrastructure/services/FixedFractionalStakeSizingService";
import { InMemoryTemporalConsensusEngine } from "@shared/infrastructure/services/InMemoryTemporalConsensusEngine";
import { MultiProviderAnalysisProvider } from "@shared/infrastructure/services/MultiProviderAnalysisProvider";
import { MultiProviderNewsContextProvider } from "@shared/infrastructure/services/MultiProviderNewsContextProvider";
import { MultiProviderShadowOutcomeProvider } from "@shared/infrastructure/services/MultiProviderShadowOutcomeProvider";

export async function createAppContainer() {
  const userDataPath = app.getPath("userData");
  const database = await SqliteDatabase.create(join(userDataPath, "tradescope-ai.sqlite"));
  const analysisRepository = new SqliteAnalysisRepository(database);
  const marketContextRepository = new SqliteMarketContextRepository(database);
  const settingsRepository = new SqliteSettingsRepository(database, safeStorage);
  const tradeJournalRepository = new SqliteTradeJournalRepository(database);
  const settingsUseCase = new ManageSettingsUseCase(settingsRepository);
  const shadowOutcomeUseCase = new ShadowOutcomeUseCase(
    marketContextRepository,
    new MultiProviderShadowOutcomeProvider()
  );
  const analyzeFrameUseCase = new AnalyzeFrameUseCase(
    new MultiProviderAnalysisProvider(),
    new ContextAwareRiskEngine(),
    new FixedFractionalStakeSizingService(),
    analysisRepository,
    marketContextRepository,
    new InMemoryTemporalConsensusEngine(),
    shadowOutcomeUseCase
  );
  const refreshMarketContextUseCase = new RefreshMarketContextUseCase(
    marketContextRepository,
    new MultiProviderNewsContextProvider()
  );

  return {
    browserWorkspace: new BrowserWorkspace(),
    desktopCaptureProvider: new DesktopCaptureProvider(),
    snapshotStorage: new SnapshotStorage(userDataPath),
    analyzeFrameUseCase,
    settingsUseCase,
    tradeJournalUseCase: new TradeJournalUseCase(tradeJournalRepository),
    analysisRepository,
    refreshMarketContextUseCase,
    marketContextRepository
  };
}
