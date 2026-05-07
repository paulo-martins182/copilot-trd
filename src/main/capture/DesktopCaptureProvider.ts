import { desktopCapturer } from "electron";
import type { CaptureSource } from "@shared/domain/services/ScreenCaptureProvider";

export class DesktopCaptureProvider {
  public async listSources(): Promise<CaptureSource[]> {
    const sources = await desktopCapturer.getSources({
      types: ["screen", "window"],
      thumbnailSize: { width: 480, height: 270 },
      fetchWindowIcons: true
    });

    return sources.map((source) => ({
      id: source.id,
      name: source.name,
      thumbnailDataUrl: source.thumbnail.toDataURL()
    }));
  }
}
