import type { AIAnalysis, FrameMetadata, ProviderMode } from "../entities/Analysis";
import type { AISettings } from "../entities/Settings";

export interface AIAnalysisProvider {
  analyzeFrame(input: AnalyzeFrameProviderInput): Promise<AIAnalysisResult>;
}

export interface AnalyzeFrameProviderInput {
  dataUrl: string;
  metadata: FrameMetadata;
  settings: AISettings;
}

export interface AIAnalysisResult {
  analysis: AIAnalysis;
  providerMode: ProviderMode;
  modelUsed: string;
}
