import { useCallback, useEffect, useRef, useState } from "react";
import type { AnalysisRecord, CaptureRegion } from "@shared/domain/entities/Analysis";
import type { BrowserCaptureResult, CaptureSource } from "@shared/domain/services/ScreenCaptureProvider";
import type { AppSettings } from "@shared/domain/entities/Settings";
import { AnalysisCard } from "@renderer/components/composition/AnalysisCard";
import { CapturePanel } from "@renderer/components/composition/CapturePanel";
import { Badge } from "@renderer/components/ui/badge";
import { Button } from "@renderer/components/ui/button";
import { Card, CardDescription, CardTitle } from "@renderer/components/ui/card";
import { Input, Label } from "@renderer/components/ui/input";
import { useBrowserBounds } from "@renderer/hooks/useBrowserBounds";
import { playSignalBeep } from "@renderer/lib/sound";

interface BrowserCopilotPageProps {
  onAnalysis: (record: AnalysisRecord) => void;
  onAlert: (record: AnalysisRecord) => void;
  onOpenAnalysis: (id: string) => void;
}

export function BrowserCopilotPage({ onAnalysis, onAlert, onOpenAnalysis }: BrowserCopilotPageProps) {
  const browserHostRef = useRef<HTMLDivElement>(null);
  const inFlightRef = useRef(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [url, setUrl] = useState("https://www.tradingview.com/chart/");
  const [region, setRegion] = useState<CaptureRegion>({ x: 0, y: 0, width: 960, height: 640 });
  const [lastCapture, setLastCapture] = useState<BrowserCaptureResult | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisRecord | null>(null);
  const [isCopilotActive, setIsCopilotActive] = useState(false);
  const [sources, setSources] = useState<CaptureSource[]>([]);
  const [error, setError] = useState<string | null>(null);

  useBrowserBounds(browserHostRef, true);

  useEffect(() => {
    void window.tradeScope.settings.getAll().then((loaded) => {
      setSettings(loaded);
      setUrl(loaded.browser.defaultUrl);
      void window.tradeScope.browser.loadUrl({ url: loaded.browser.defaultUrl });
    });
    void window.tradeScope.capture.listSources().then(setSources).catch(() => setSources([]));
  }, []);

  const loadUrl = async () => {
    setError(null);
    await window.tradeScope.browser.loadUrl({ url });
    if (settings) {
      await window.tradeScope.settings.updateBrowser({ defaultUrl: url });
    }
  };

  const captureOnce = useCallback(async () => {
    setError(null);
    const capture = await window.tradeScope.browser.captureRegion(region);
    setLastCapture(capture);
    return capture;
  }, [region]);

  const analyzeCapture = useCallback(
    async (capture: BrowserCaptureResult) => {
      const record = await window.tradeScope.analysis.analyzeFrame({
        dataUrl: capture.dataUrl,
        metadata: {
          sourceType: "BROWSER",
          sourceId: "tradingview-webcontentsview",
          region: capture.region,
          capturedAt: capture.capturedAt
        }
      });
      setLastAnalysis(record);
      onAnalysis(record);
      if (record.decision.shouldAlert) {
        playSignalBeep();
        onAlert(record);
      }
      return record;
    },
    [onAlert, onAnalysis]
  );

  const captureAndAnalyze = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      const capture = await captureOnce();
      await analyzeCapture(capture);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Falha ao analisar frame.");
    } finally {
      inFlightRef.current = false;
    }
  }, [analyzeCapture, captureOnce]);

  useEffect(() => {
    if (!isCopilotActive) return;
    void captureAndAnalyze();
    const interval = window.setInterval(() => {
      void captureAndAnalyze();
    }, 2000);
    return () => window.clearInterval(interval);
  }, [captureAndAnalyze, isCopilotActive]);

  const useFullRegion = () => {
    const bounds = browserHostRef.current?.getBoundingClientRect();
    setRegion({
      x: 0,
      y: 0,
      width: Math.max(1, Math.round(bounds?.width ?? 960)),
      height: Math.max(1, Math.round(bounds?.height ?? 640))
    });
  };

  return (
    <div className="grid h-full grid-cols-[1fr_420px] gap-4 p-4">
      <section className="flex min-w-0 flex-col gap-4">
        <Card className="flex items-center gap-3 p-3">
          <Label className="mb-0 w-28">URL</Label>
          <Input value={url} onChange={(event) => setUrl(event.target.value)} />
          <Button onClick={loadUrl}>Abrir</Button>
          <Badge tone={isCopilotActive ? "success" : "neutral"}>{isCopilotActive ? "Copilot ativo" : "Copilot parado"}</Badge>
        </Card>
        <div ref={browserHostRef} className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-border bg-black/30">
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-muted">
            Navegador embutido carregando TradingView…
          </div>
        </div>
      </section>

      <aside className="min-h-0 space-y-4 overflow-y-auto pr-1">
        <Card>
          <CardTitle>Copiloto de gráfico</CardTitle>
          <CardDescription>
            Analisa frames a cada 2s e alerta somente sinais aprovados por regras locais.
          </CardDescription>
          {settings?.openrouter.apiKey || settings?.openrouter.useMockProvider ? null : (
            <div className="mt-3 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-amber-200">
              Sem OpenRouter API Key: o provider mock será usado para validar o fluxo.
            </div>
          )}
        </Card>

        <CapturePanel.Root>
          <CapturePanel.RegionSelector region={region} onChange={setRegion} />
          <CapturePanel.Controls
            isCopilotActive={isCopilotActive}
            onCapture={() => void captureAndAnalyze()}
            onToggleCopilot={() => setIsCopilotActive((value) => !value)}
          />
          <CapturePanel.Preview capture={lastCapture} region={region} onUseFull={useFullRegion} />
          <CapturePanel.SourceSelector sources={sources} />
        </CapturePanel.Root>

        {error ? <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-red-200">{error}</div> : null}

        <AnalysisCard.Root>
          <AnalysisCard.Header description="Resultado mais recente após IA + rule engine." />
          <AnalysisCard.Signal record={lastAnalysis} />
          <AnalysisCard.Confidence record={lastAnalysis} />
          <AnalysisCard.Reasoning record={lastAnalysis} />
          <AnalysisCard.Details record={lastAnalysis} />
          <AnalysisCard.Checklist record={lastAnalysis} />
          <AnalysisCard.Actions>
            <Button disabled={!lastAnalysis} onClick={() => lastAnalysis && onOpenAnalysis(lastAnalysis.id)}>
              Ver detalhes
            </Button>
          </AnalysisCard.Actions>
        </AnalysisCard.Root>
      </aside>
    </div>
  );
}
