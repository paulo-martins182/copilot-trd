import { useEffect, useState } from "react";
import type { AppSettings } from "@shared/domain/entities/Settings";
import { Button } from "@renderer/components/ui/button";
import { Card, CardDescription, CardTitle } from "@renderer/components/ui/card";
import { Input, Label } from "@renderer/components/ui/input";

export function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    void window.tradeScope.settings.getAll().then(setSettings);
  }, []);

  if (!settings) {
    return <div className="p-6 text-sm text-muted">Carregando configurações…</div>;
  }

  const saveOpenRouter = async () => {
    const openrouter = await window.tradeScope.settings.updateOpenRouter(settings.openrouter);
    setSettings({ ...settings, openrouter });
    setStatus("Configurações da OpenRouter salvas.");
  };

  const saveRisk = async () => {
    const risk = await window.tradeScope.settings.updateRisk(settings.risk);
    setSettings({ ...settings, risk });
    setStatus("Configurações de risco salvas.");
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4">
        <Card className="space-y-4">
          <div>
            <CardTitle>OpenRouter Free</CardTitle>
            <CardDescription>Modelo padrão: Gemma 4 31B free, com fallback para openrouter/free.</CardDescription>
          </div>
          <div>
            <Label>OpenRouter API Key</Label>
            <Input
              type="password"
              value={settings.openrouter.apiKey ?? ""}
              placeholder="sk-or-v1-..."
              onChange={(event) =>
                setSettings({ ...settings, openrouter: { ...settings.openrouter, apiKey: event.target.value } })
              }
            />
          </div>
          <div>
            <Label>Modelo free principal</Label>
            <Input
              value={settings.openrouter.model}
              onChange={(event) =>
                setSettings({ ...settings, openrouter: { ...settings.openrouter, model: event.target.value } })
              }
            />
          </div>
          <div>
            <Label>Fallback free</Label>
            <Input
              value={settings.openrouter.fallbackModel}
              onChange={(event) =>
                setSettings({ ...settings, openrouter: { ...settings.openrouter, fallbackModel: event.target.value } })
              }
            />
          </div>
          <label className="flex items-center gap-3 rounded-xl border border-border bg-black/20 p-3 text-sm">
            <input
              type="checkbox"
              checked={settings.openrouter.useMockProvider}
              onChange={(event) =>
                setSettings({ ...settings, openrouter: { ...settings.openrouter, useMockProvider: event.target.checked } })
              }
            />
            Usar provider mockável
          </label>
          <Button onClick={saveOpenRouter}>Salvar OpenRouter</Button>
        </Card>

        <Card className="space-y-4">
          <div>
            <CardTitle>Risco</CardTitle>
            <CardDescription>Valor sugerido é limite máximo por operação, sem martingale.</CardDescription>
          </div>
          <NumberField
            label="Banca"
            value={settings.risk.bankroll}
            onChange={(bankroll) => setSettings({ ...settings, risk: { ...settings.risk, bankroll } })}
          />
          <NumberField
            label="% de risco por operação"
            value={settings.risk.riskPercent}
            onChange={(riskPercent) => setSettings({ ...settings, risk: { ...settings.risk, riskPercent } })}
          />
          <NumberField
            label="Valor máximo"
            value={settings.risk.maxStake}
            onChange={(maxStake) => setSettings({ ...settings, risk: { ...settings.risk, maxStake } })}
          />
          <NumberField
            label="Confiança mínima"
            value={settings.risk.minConfidence}
            onChange={(minConfidence) => setSettings({ ...settings, risk: { ...settings.risk, minConfidence } })}
          />
          <NumberField
            label="Sinal atrasado após (ms)"
            value={settings.risk.staleAfterMs}
            onChange={(staleAfterMs) => setSettings({ ...settings, risk: { ...settings.risk, staleAfterMs } })}
          />
          <NumberField
            label="Máximo para 1m (ms)"
            value={settings.risk.maxOneMinuteLatencyMs}
            onChange={(maxOneMinuteLatencyMs) =>
              setSettings({ ...settings, risk: { ...settings.risk, maxOneMinuteLatencyMs } })
            }
          />
          <Button onClick={saveRisk}>Salvar risco</Button>
        </Card>

        {status ? <div className="col-span-2 rounded-xl border border-success/30 bg-success/10 p-3 text-sm text-emerald-200">{status}</div> : null}
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </div>
  );
}
