import type { PropsWithChildren } from "react";
import type { BrowserCaptureResult, CaptureSource } from "@shared/domain/services/ScreenCaptureProvider";
import type { CaptureRegion } from "@shared/domain/entities/Analysis";
import { Button } from "@renderer/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@renderer/components/ui/card";
import { Input, Label } from "@renderer/components/ui/input";
import { cn } from "@renderer/lib/cn";

function Root({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <Card className={cn("space-y-4", className)}>{children}</Card>;
}

function SourceSelector({ sources }: { sources: CaptureSource[] }) {
  return (
    <div>
      <div className="mb-2 text-xs uppercase tracking-wide text-muted">Fallback desktopCapturer</div>
      <div className="max-h-32 space-y-2 overflow-y-auto">
        {sources.length === 0 ? (
          <div className="text-sm text-muted">Use o navegador embutido como fonte principal.</div>
        ) : (
          sources.slice(0, 5).map((source) => (
            <div key={source.id} className="rounded-xl border border-border bg-black/20 p-2 text-xs text-zinc-300">
              {source.name}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function RegionSelector({
  region,
  onChange
}: {
  region: CaptureRegion;
  onChange: (region: CaptureRegion) => void;
}) {
  const update = (key: keyof CaptureRegion, value: string) => {
    onChange({ ...region, [key]: Number(value) || 0 });
  };
  return (
    <div className="grid grid-cols-2 gap-3">
      {(["x", "y", "width", "height"] as const).map((key) => (
        <div key={key}>
          <Label>{key}</Label>
          <Input type="number" value={region[key]} onChange={(event) => update(key, event.target.value)} />
        </div>
      ))}
    </div>
  );
}

function Controls({
  isCopilotActive,
  onCapture,
  onToggleCopilot,
  disabled
}: {
  isCopilotActive: boolean;
  onCapture: () => void;
  onToggleCopilot: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <Button onClick={onCapture} disabled={disabled}>
        Capturar frame
      </Button>
      <Button variant={isCopilotActive ? "danger" : "primary"} onClick={onToggleCopilot} disabled={disabled}>
        {isCopilotActive ? "Parar copiloto" : "Ativar copiloto"}
      </Button>
    </div>
  );
}

function Preview({
  capture,
  region,
  onUseFull
}: {
  capture?: BrowserCaptureResult | null;
  region: CaptureRegion;
  onUseFull: () => void;
}) {
  return (
    <div>
      <CardHeader className="mb-2 p-0">
        <div>
          <CardTitle>Preview</CardTitle>
          <CardDescription>Use os campos de região para recortar o gráfico.</CardDescription>
        </div>
        <Button variant="ghost" onClick={onUseFull}>
          Tela toda
        </Button>
      </CardHeader>
      <div className="overflow-hidden rounded-xl border border-border bg-black/30">
        {capture ? (
          <img src={capture.dataUrl} alt="Frame capturado" className="max-h-56 w-full object-contain" />
        ) : (
          <div className="flex h-40 items-center justify-center text-sm text-muted">Nenhum frame capturado</div>
        )}
      </div>
      <div className="mt-2 text-xs text-muted">
        Região atual: {region.x}, {region.y}, {region.width}×{region.height}
      </div>
    </div>
  );
}

export const CapturePanel = {
  Root,
  SourceSelector,
  RegionSelector,
  Controls,
  Preview
};
