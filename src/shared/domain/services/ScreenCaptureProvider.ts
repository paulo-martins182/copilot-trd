import type { CaptureRegion } from "../entities/Analysis";

export interface BrowserBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CaptureSource {
  id: string;
  name: string;
  thumbnailDataUrl?: string;
}

export interface BrowserCaptureResult {
  dataUrl: string;
  capturedAt: string;
  region: CaptureRegion;
}

export interface ScreenCaptureProvider {
  listSources(): Promise<CaptureSource[]>;
  captureBrowserRegion(region: CaptureRegion): Promise<BrowserCaptureResult>;
}
