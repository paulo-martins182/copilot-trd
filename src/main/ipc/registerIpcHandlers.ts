import { ipcMain } from "electron";
import type { BrowserWorkspace } from "@main/electron/BrowserWorkspace";
import type { DesktopCaptureProvider } from "@main/capture/DesktopCaptureProvider";
import type { SnapshotStorage } from "@main/capture/SnapshotStorage";
import type { AnalyzeFrameUseCase } from "@shared/application/use-cases/AnalyzeFrameUseCase";
import type { ManageSettingsUseCase } from "@shared/application/use-cases/ManageSettingsUseCase";
import type { TradeJournalUseCase } from "@shared/application/use-cases/TradeJournalUseCase";
import type { AnalysisRepository } from "@shared/domain/repositories/AnalysisRepository";
import {
  analyzeFrameRequestSchema,
  browserBoundsSchema,
  browserVisibleSchema,
  browserSettingsSchema,
  captureRegionSchema,
  historyRequestSchema,
  idRequestSchema,
  loadUrlSchema,
  openRouterSettingsSchema,
  riskSettingsSchema,
  tradeJournalCreateSchema
} from "@shared/presentation/dtos/schemas";
import { channels } from "./channels";

interface RegisterIpcHandlersInput {
  browserWorkspace: BrowserWorkspace;
  desktopCaptureProvider: DesktopCaptureProvider;
  snapshotStorage: SnapshotStorage;
  analyzeFrameUseCase: AnalyzeFrameUseCase;
  settingsUseCase: ManageSettingsUseCase;
  tradeJournalUseCase: TradeJournalUseCase;
  analysisRepository: AnalysisRepository;
}

const lastAlertAtBySignal: Partial<Record<"BUY" | "SELL", string>> = {};

export function registerIpcHandlers(input: RegisterIpcHandlersInput): void {
  ipcMain.handle(channels.browserLoadUrl, async (_event, payload: unknown) => {
    const { url } = loadUrlSchema.parse(payload);
    await input.browserWorkspace.loadUrl(url);
  });

  ipcMain.handle(channels.browserSetBounds, (_event, payload: unknown) => {
    input.browserWorkspace.setBounds(browserBoundsSchema.parse(payload));
  });

  ipcMain.handle(channels.browserSetVisible, (_event, payload: unknown) => {
    const { visible } = browserVisibleSchema.parse(payload);
    input.browserWorkspace.setVisible(visible);
  });

  ipcMain.handle(channels.browserCaptureRegion, (_event, payload: unknown) => {
    return input.browserWorkspace.captureRegion(captureRegionSchema.parse(payload));
  });

  ipcMain.handle(channels.captureListSources, () => {
    return input.desktopCaptureProvider.listSources();
  });

  ipcMain.handle(channels.analysisAnalyzeFrame, async (_event, payload: unknown) => {
    const parsed = analyzeFrameRequestSchema.parse(payload);
    const settings = await input.settingsUseCase.getAll();
    const snapshotId = crypto.randomUUID();
    const snapshotPath = await input.snapshotStorage.save(parsed.dataUrl, snapshotId);
    const record = await input.analyzeFrameUseCase.execute({
      dataUrl: parsed.dataUrl,
      metadata: parsed.metadata,
      settings,
      snapshotPath,
      lastAlertAtBySignal
    });

    if (record.decision.shouldAlert && (record.decision.finalSignal === "BUY" || record.decision.finalSignal === "SELL")) {
      lastAlertAtBySignal[record.decision.finalSignal] = new Date().toISOString();
    }

    return record;
  });

  ipcMain.handle(channels.analysisGetHistory, (_event, payload: unknown) => {
    const parsed = historyRequestSchema.parse(payload ?? {});
    return input.analysisRepository.list(parsed.limit);
  });

  ipcMain.handle(channels.analysisGetById, (_event, payload: unknown) => {
    const { id } = idRequestSchema.parse(payload);
    return input.analysisRepository.findById(id);
  });

  ipcMain.handle(channels.settingsGetAll, () => {
    return input.settingsUseCase.getAll();
  });

  ipcMain.handle(channels.settingsUpdateRisk, (_event, payload: unknown) => {
    return input.settingsUseCase.updateRisk(riskSettingsSchema.parse(payload));
  });

  ipcMain.handle(channels.settingsUpdateOpenRouter, (_event, payload: unknown) => {
    return input.settingsUseCase.updateOpenRouter(openRouterSettingsSchema.parse(payload));
  });

  ipcMain.handle(channels.settingsUpdateBrowser, (_event, payload: unknown) => {
    return input.settingsUseCase.updateBrowser(browserSettingsSchema.parse(payload));
  });

  ipcMain.handle(channels.journalCreate, async (_event, payload: unknown) => {
    await input.tradeJournalUseCase.create(tradeJournalCreateSchema.parse(payload));
  });

  ipcMain.handle(channels.journalList, (_event, payload: unknown) => {
    const parsed = historyRequestSchema.parse(payload ?? {});
    return input.tradeJournalUseCase.list(parsed.limit);
  });

  ipcMain.handle(channels.journalMetrics, () => {
    return input.tradeJournalUseCase.metrics();
  });
}
