import { BrowserWindow, WebContentsView, shell } from "electron";
import type { BrowserBounds, BrowserCaptureResult } from "@shared/domain/services/ScreenCaptureProvider";
import type { CaptureRegion } from "@shared/domain/entities/Analysis";

export class BrowserWorkspace {
  private view: WebContentsView | null = null;
  private bounds: BrowserBounds = { x: 0, y: 0, width: 0, height: 0 };

  public attach(window: BrowserWindow): void {
    if (this.view) return;

    this.view = new WebContentsView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true,
        partition: "persist:tradescope-browser"
      }
    });

    this.view.webContents.setWindowOpenHandler(({ url }) => {
      void shell.openExternal(url);
      return { action: "deny" };
    });

    window.contentView.addChildView(this.view);
    this.view.setBounds(this.bounds);
  }

  public async loadUrl(url: string): Promise<void> {
    const view = this.requireView();
    const parsed = new URL(url);
    if (!["https:", "http:"].includes(parsed.protocol)) {
      throw new Error("Only http/https URLs are allowed in the embedded browser.");
    }
    await view.webContents.loadURL(parsed.toString());
  }

  public setBounds(bounds: BrowserBounds): void {
    this.bounds = bounds;
    this.requireView().setBounds({
      x: Math.round(bounds.x),
      y: Math.round(bounds.y),
      width: Math.max(0, Math.round(bounds.width)),
      height: Math.max(0, Math.round(bounds.height))
    });
  }

  public setVisible(visible: boolean): void {
    if (!this.view) return;
    if (visible) {
      this.view.setBounds(this.bounds);
      return;
    }
    this.view.setBounds({ x: 0, y: 0, width: 0, height: 0 });
  }

  public async captureRegion(region: CaptureRegion): Promise<BrowserCaptureResult> {
    const view = this.requireView();
    const normalizedRegion = {
      x: Math.max(0, Math.round(region.x)),
      y: Math.max(0, Math.round(region.y)),
      width: Math.max(1, Math.round(region.width)),
      height: Math.max(1, Math.round(region.height))
    };
    const image = await view.webContents.capturePage(normalizedRegion);
    const dataUrl = `data:image/png;base64,${image.toPNG().toString("base64")}`;
    return {
      dataUrl,
      capturedAt: new Date().toISOString(),
      region: normalizedRegion
    };
  }

  private requireView(): WebContentsView {
    if (!this.view) {
      throw new Error("Browser workspace is not attached.");
    }
    return this.view;
  }
}
