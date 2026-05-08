import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  Bot,
  CircleDot,
  Gauge,
  History,
  Layers3,
  Newspaper,
  RefreshCw,
  Scale,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  type LucideIcon
} from "lucide-react";
import type { AnalysisRecord } from "@shared/domain/entities/Analysis";
import type { MarketContextSnapshot } from "@shared/domain/entities/MarketContext";
import { TradeScopeLogo } from "@renderer/components/brand/TradeScopeLogo";
import { CopilotAlert } from "@renderer/components/composition/CopilotAlert";
import { isHighProbabilitySignal, SignalToastStack, type SignalToastItem } from "@renderer/components/composition/SignalToast";
import { Badge } from "@renderer/components/ui/badge";
import { Button } from "@renderer/components/ui/button";
import { cn } from "@renderer/lib/cn";
import { formatDateTime, formatMacroRisk, formatMarketBias, formatProviderMode } from "@renderer/lib/format";
import { DashboardPage } from "@renderer/features/dashboard/DashboardPage";
import { BrowserCopilotPage } from "@renderer/features/copilot/BrowserCopilotPage";
import { RealtimeAnalysisPage } from "@renderer/features/copilot/RealtimeAnalysisPage";
import { HistoryPage } from "@renderer/features/history/HistoryPage";
import { AnalysisDetailPage } from "@renderer/features/history/AnalysisDetailPage";
import { JournalPage } from "@renderer/features/journal/JournalPage";
import { SettingsPage } from "@renderer/features/settings/SettingsPage";
import { TermsPage } from "@renderer/features/terms/TermsPage";

type Page = "dashboard" | "copilot" | "realtime" | "history" | "journal" | "settings" | "terms" | "detail";

const navItems: Array<{ page: Page; label: string; icon: LucideIcon }> = [
  { page: "dashboard", label: "Dashboard", icon: Layers3 },
  { page: "copilot", label: "Browser Copilot", icon: Bot },
  { page: "realtime", label: "Tempo real", icon: Gauge },
  { page: "history", label: "Historico", icon: History },
  { page: "journal", label: "Journal", icon: BookOpen },
  { page: "settings", label: "Configuracoes", icon: Scale },
  { page: "terms", label: "Termos", icon: ShieldAlert }
];

export function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisRecord | null>(null);
  const [alertRecord, setAlertRecord] = useState<AnalysisRecord | null>(null);
  const [signalToasts, setSignalToasts] = useState<SignalToastItem[]>([]);
  const [marketContext, setMarketContext] = useState<MarketContextSnapshot | null>(null);
  const [isRefreshingContext, setIsRefreshingContext] = useState(false);

  useEffect(() => {
    if (page !== "copilot") {
      void window.tradeScope.browser.setVisible({ visible: false });
    }
  }, [page]);

  useEffect(() => {
    void window.tradeScope.marketContext.getLatest().then(setMarketContext);
  }, []);

  const openDetail = (id: string) => {
    setSelectedAnalysisId(id);
    setPage("detail");
  };

  const handleAlert = (record: AnalysisRecord) => {
    setAlertRecord(record);
    if (!isHighProbabilitySignal(record)) return;
    const item = { id: `${record.id}-${Date.now()}`, record };
    setSignalToasts((current) => [item, ...current].slice(0, 3));
    window.setTimeout(() => {
      setSignalToasts((current) => current.filter((toast) => toast.id !== item.id));
    }, 7000);
  };

  const refreshContext = async () => {
    setIsRefreshingContext(true);
    try {
      const snapshot = await window.tradeScope.marketContext.refresh();
      setMarketContext(snapshot);
    } finally {
      setIsRefreshingContext(false);
    }
  };

  const providerMode = lastAnalysis?.decision.providerMode;
  const contextExpired = marketContext ? new Date(marketContext.expiresAt).getTime() < Date.now() : true;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-zinc-100">
      <aside className="flex w-72 shrink-0 flex-col border-r border-border/80 bg-surface/75 p-5 backdrop-blur-xl">
        <div className="mb-6 rounded-3xl border border-white/8 bg-gradient-to-br from-slate-900/90 to-slate-950/80 p-4 shadow-panel">
          <TradeScopeLogo />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                <TrendingUp className="h-3.5 w-3.5 text-accent" />
                Setup
              </div>
              <div className="mt-1 text-sm font-semibold text-white">BTC · 2M</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                <Sparkles className="h-3.5 w-3.5 text-accentSoft" />
                Engine
              </div>
              <div className="mt-1 text-sm font-semibold text-white">Precision</div>
            </div>
          </div>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.page}
                onClick={() => setPage(item.page)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left text-sm transition",
                  page === item.page
                    ? "border-accent/20 bg-gradient-to-r from-accent/12 to-accentSoft/12 text-white shadow-panel"
                    : "border-transparent text-muted hover:border-white/8 hover:bg-white/[0.04] hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-xl border",
                    page === item.page
                      ? "border-accent/25 bg-accent/12 text-accent"
                      : "border-white/8 bg-white/[0.03] text-slate-400"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex flex-1 items-center justify-between">
                  <span>{item.label}</span>
                  {page === item.page ? <CircleDot className="h-3.5 w-3.5 text-accent" /> : null}
                </span>
              </button>
            );
          })}
        </nav>
        <div className="mt-auto rounded-3xl border border-warning/20 bg-gradient-to-br from-warning/12 to-danger/10 p-4 text-xs text-amber-200 shadow-panel">
          <div className="mb-2 flex items-center gap-2 font-semibold uppercase tracking-[0.16em] text-amber-100">
            <ShieldAlert className="h-4 w-4" />
            Risk Notice
          </div>
          Nao e recomendacao financeira. O sistema prioriza poucos sinais e bloqueia contexto incerto.
        </div>
      </aside>

      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-border/80 bg-background/55 px-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <TradeScopeLogo compact />
            <div className="h-10 w-px bg-white/8" />
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">BTC / 2 minutos / alta precisao</div>
              <h1 className="text-lg font-semibold tracking-tight text-white">
                {navItems.find((item) => item.page === page)?.label ?? "Detalhes"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {providerMode ? (
              <Badge tone={providerMode === "REAL" ? "success" : "warning"}>{formatProviderMode(providerMode)}</Badge>
            ) : null}
            {marketContext ? (
              <Badge tone={contextExpired ? "warning" : "accent"}>
                {contextExpired ? "Contexto expirado" : "Contexto atualizado"}
              </Badge>
            ) : (
              <Badge tone="neutral">Sem contexto</Badge>
            )}
            <Button variant="secondary" onClick={() => void refreshContext()} disabled={isRefreshingContext}>
              <RefreshCw className={cn("h-4 w-4", isRefreshingContext && "animate-spin")} />
              Atualizar contexto IA
            </Button>
            <Button variant="ghost" onClick={() => setPage("terms")}>
              Seguranca e etica
            </Button>
          </div>
        </header>
        {marketContext ? (
          <div className="flex items-center gap-3 border-b border-border/70 bg-white/[0.02] px-6 py-3 text-xs text-muted">
            <div className="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5">
              <Newspaper className="h-3.5 w-3.5" />
              {formatMarketBias(marketContext.marketBias)} / {formatMacroRisk(marketContext.riskState)}
            </div>
            <div className="max-w-3xl truncate">{marketContext.analysisImpact}</div>
            <div className="ml-auto">Atualizado em {formatDateTime(marketContext.updatedAt)}</div>
          </div>
        ) : null}
        <div className="min-h-0 flex-1 overflow-hidden bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.05),transparent_30rem)]">
          {page === "dashboard" ? <DashboardPage onOpenAnalysis={openDetail} /> : null}
          {page === "copilot" ? (
            <BrowserCopilotPage
              onAnalysis={(record) => setLastAnalysis(record)}
              onAlert={handleAlert}
              onOpenAnalysis={openDetail}
            />
          ) : null}
          {page === "realtime" ? <RealtimeAnalysisPage record={lastAnalysis} onOpenAnalysis={openDetail} /> : null}
          {page === "history" ? <HistoryPage onOpenAnalysis={openDetail} /> : null}
          {page === "detail" && selectedAnalysisId ? <AnalysisDetailPage id={selectedAnalysisId} /> : null}
          {page === "journal" ? <JournalPage /> : null}
          {page === "settings" ? <SettingsPage /> : null}
          {page === "terms" ? <TermsPage /> : null}
        </div>
      </main>
      <CopilotAlert record={alertRecord} onDismiss={() => setAlertRecord(null)} />
      <SignalToastStack items={signalToasts} />
    </div>
  );
}
