import { useEffect, useState } from "react";
import { Activity, BarChart3, BookOpen, Gauge, History, Scale, ShieldAlert, type LucideIcon } from "lucide-react";
import type { AnalysisRecord } from "@shared/domain/entities/Analysis";
import { CopilotAlert } from "@renderer/components/composition/CopilotAlert";
import { isHighProbabilitySignal, SignalToastStack, type SignalToastItem } from "@renderer/components/composition/SignalToast";
import { Button } from "@renderer/components/ui/button";
import { cn } from "@renderer/lib/cn";
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
  { page: "dashboard", label: "Dashboard", icon: BarChart3 },
  { page: "copilot", label: "Browser Copilot", icon: Activity },
  { page: "realtime", label: "Tempo real", icon: Gauge },
  { page: "history", label: "Histórico", icon: History },
  { page: "journal", label: "Journal", icon: BookOpen },
  { page: "settings", label: "Configurações", icon: Scale },
  { page: "terms", label: "Termos", icon: ShieldAlert }
];

export function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisRecord | null>(null);
  const [alertRecord, setAlertRecord] = useState<AnalysisRecord | null>(null);
  const [signalToasts, setSignalToasts] = useState<SignalToastItem[]>([]);

  useEffect(() => {
    if (page !== "copilot") {
      void window.tradeScope.browser.setVisible({ visible: false });
    }
  }, [page]);

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

  return (
    <div className="flex h-screen w-screen overflow-hidden text-zinc-100">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-surface/80 p-4 backdrop-blur">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-accent/20 text-accent">
              <Activity size={20} />
            </div>
            <div>
              <div className="font-semibold text-white">TradeScope AI</div>
              <div className="text-xs text-muted">Analytical copilot</div>
            </div>
          </div>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.page}
                onClick={() => setPage(item.page)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-muted transition hover:bg-white/5 hover:text-white",
                  page === item.page && "bg-white/8 text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto rounded-2xl border border-warning/20 bg-warning/10 p-3 text-xs text-amber-200">
          Não é recomendação financeira. Você decide e assume o risco.
        </div>
      </aside>

      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/65 px-6 backdrop-blur">
          <div>
            <div className="text-sm text-muted">MVP funcional inicial</div>
            <h1 className="text-lg font-semibold text-white">{navItems.find((item) => item.page === page)?.label ?? "Detalhes"}</h1>
          </div>
          <Button variant="ghost" onClick={() => setPage("terms")}>
            Segurança e ética
          </Button>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden">
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
