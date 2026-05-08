import type { AnalysisRecord, CaptureRegion } from "@shared/domain/entities/Analysis";
import type { MarketContextSnapshot, ShadowPrediction, SetupPerformance } from "@shared/domain/entities/MarketContext";
import type { AISettings, AppSettings, BrowserSettings, RiskSettings } from "@shared/domain/entities/Settings";
import type { CaptureSource, BrowserBounds, BrowserCaptureResult } from "@shared/domain/services/ScreenCaptureProvider";
import type { TradeJournalEntry, TradeJournalMetrics } from "@shared/domain/entities/TradeJournal";

export interface TradeScopeAPI {
  browser: {
    loadUrl(input: { url: string }): Promise<void>;
    setBounds(bounds: BrowserBounds): Promise<void>;
    captureRegion(region: CaptureRegion): Promise<BrowserCaptureResult>;
    setVisible(input: { visible: boolean }): Promise<void>;
  };
  capture: {
    listSources(): Promise<CaptureSource[]>;
  };
  analysis: {
    analyzeFrame(input: {
      dataUrl: string;
      metadata: {
        sourceType: "BROWSER" | "SCREEN";
        sourceId: string;
        region: CaptureRegion;
        capturedAt: string;
      };
    }): Promise<AnalysisRecord>;
    getHistory(input?: { limit?: number }): Promise<AnalysisRecord[]>;
    getById(input: { id: string }): Promise<AnalysisRecord | null>;
  };
  marketContext: {
    refresh(): Promise<MarketContextSnapshot>;
    getLatest(): Promise<MarketContextSnapshot | null>;
    getRecentOutcomes(input?: { limit?: number }): Promise<ShadowPrediction[]>;
    getSetupPerformance(input: { setupLabel: string }): Promise<SetupPerformance>;
  };
  settings: {
    getAll(): Promise<AppSettings>;
    updateRisk(settings: RiskSettings): Promise<RiskSettings>;
    updateAI(settings: AISettings): Promise<AISettings>;
    updateBrowser(settings: BrowserSettings): Promise<BrowserSettings>;
  };
  journal: {
    create(input: Omit<TradeJournalEntry, "id" | "createdAt">): Promise<void>;
    list(input?: { limit?: number }): Promise<TradeJournalEntry[]>;
    metrics(): Promise<TradeJournalMetrics>;
  };
}
