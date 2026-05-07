import type { AnalysisRecord, CaptureRegion } from "@shared/domain/entities/Analysis";
import type { AppSettings, BrowserSettings, OpenRouterSettings, RiskSettings } from "@shared/domain/entities/Settings";
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
  settings: {
    getAll(): Promise<AppSettings>;
    updateRisk(settings: RiskSettings): Promise<RiskSettings>;
    updateOpenRouter(settings: OpenRouterSettings): Promise<OpenRouterSettings>;
    updateBrowser(settings: BrowserSettings): Promise<BrowserSettings>;
  };
  journal: {
    create(input: Omit<TradeJournalEntry, "id" | "createdAt">): Promise<void>;
    list(input?: { limit?: number }): Promise<TradeJournalEntry[]>;
    metrics(): Promise<TradeJournalMetrics>;
  };
}
