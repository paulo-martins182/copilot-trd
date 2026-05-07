import type { AIAnalysis, FrameMetadata } from "../entities/Analysis";
import type { OpenRouterSettings } from "../entities/Settings";

export interface AIAnalysisProvider {
  analyzeFrame(input: AnalyzeFrameProviderInput): Promise<AIAnalysis>;
}

export interface AnalyzeFrameProviderInput {
  dataUrl: string;
  metadata: FrameMetadata;
  settings: OpenRouterSettings;
}
