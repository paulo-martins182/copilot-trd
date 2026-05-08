import { useEffect, useMemo, useState } from "react";
import type { AIProviderKind, AppSettings } from "@shared/domain/entities/Settings";
import { aiModelCatalog } from "@shared/domain/entities/Settings";
import { Button } from "@renderer/components/ui/button";
import { Card, CardDescription, CardTitle } from "@renderer/components/ui/card";
import { Input, Label } from "@renderer/components/ui/input";

export function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    void window.tradeScope.settings.getAll().then(setSettings);
  }, []);

  const providerModels = useMemo(
    () => aiModelCatalog.filter((option) => option.provider === settings?.ai.provider),
    [settings?.ai.provider]
  );

  if (!settings) {
    return <div className="p-6 text-sm text-muted">Carregando configuracoes...</div>;
  }

  const ensureProviderModels = (provider: AIProviderKind) => {
    const models = aiModelCatalog.filter((option) => option.provider === provider);
    const primary = models[0]?.value ?? settings.ai.model;
    const fallback = models[1]?.value ?? models[0]?.value ?? settings.ai.fallbackModel;
    return { primary, fallback };
  };

  const saveAI = async () => {
    const ai = await window.tradeScope.settings.updateAI(settings.ai);
    setSettings({ ...settings, ai });
    setStatus("Configuracoes da IA salvas.");
  };

  const saveRisk = async () => {
    const risk = await window.tradeScope.settings.updateRisk(settings.risk);
    setSettings({ ...settings, risk });
    setStatus("Configuracoes de precisao salvas.");
  };

  const saveBrowser = async () => {
    const browser = await window.tradeScope.settings.updateBrowser(settings.browser);
    setSettings({ ...settings, browser });
    setStatus("Configuracoes do browser salvas.");
  };

  const currentApiKey = settings.ai.provider === "GOOGLE" ? settings.ai.googleApiKey ?? "" : settings.ai.openRouterApiKey ?? "";

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4">
        <Card className="space-y-4">
          <div>
            <CardTitle>Provider de IA</CardTitle>
            <CardDescription>
              Selecione o provider, escolha o modelo e informe a API key correspondente. OpenRouter continua útil para free tier; Google AI usa Gemini direto.
            </CardDescription>
          </div>

          <SelectField
            label="Provider"
            value={settings.ai.provider}
            onChange={(provider) => {
              const models = ensureProviderModels(provider as AIProviderKind);
              setSettings({
                ...settings,
                ai: {
                  ...settings.ai,
                  provider: provider as AIProviderKind,
                  model: models.primary,
                  fallbackModel: models.fallback
                }
              });
            }}
            options={[
              { value: "OPENROUTER", label: "OpenRouter" },
              { value: "GOOGLE", label: "Google AI (Gemini)" }
            ]}
          />

          <TextField
            label={settings.ai.provider === "GOOGLE" ? "Google AI API Key" : "OpenRouter API Key"}
            type="password"
            value={currentApiKey}
            onChange={(apiKey) =>
              setSettings({
                ...settings,
                ai:
                  settings.ai.provider === "GOOGLE"
                    ? { ...settings.ai, googleApiKey: apiKey }
                    : { ...settings.ai, openRouterApiKey: apiKey }
              })
            }
          />

          <SelectField
            label="Modelo principal"
            value={settings.ai.model}
            onChange={(model) => setSettings({ ...settings, ai: { ...settings.ai, model } })}
            options={providerModels.map((option) => ({
              value: option.value,
              label: `${option.label} · ${option.tier}`
            }))}
          />

          <SelectField
            label="Fallback"
            value={settings.ai.fallbackModel}
            onChange={(fallbackModel) => setSettings({ ...settings, ai: { ...settings.ai, fallbackModel } })}
            options={providerModels.map((option) => ({
              value: option.value,
              label: `${option.label} · ${option.tier}`
            }))}
          />

          <Toggle
            label="Usar provider mockavel"
            checked={settings.ai.useMockProvider}
            onChange={(useMockProvider) => setSettings({ ...settings, ai: { ...settings.ai, useMockProvider } })}
          />
          <Button onClick={() => void saveAI()}>Salvar IA</Button>
        </Card>

        <Card className="space-y-4">
          <div>
            <CardTitle>Precisao e risco</CardTitle>
            <CardDescription>Esses gates controlam a raridade dos alertas e o modo shadow/calibracao.</CardDescription>
          </div>
          <NumberField label="Confianca minima IA" value={settings.risk.minConfidence} onChange={(minConfidence) => setSettings({ ...settings, risk: { ...settings.risk, minConfidence } })} />
          <NumberField label="Janela de consenso" value={settings.risk.consensusWindowSize} onChange={(consensusWindowSize) => setSettings({ ...settings, risk: { ...settings.risk, consensusWindowSize } })} />
          <NumberField label="Consenso minimo (0-1)" value={settings.risk.minConsensusScore} onChange={(minConsensusScore) => setSettings({ ...settings, risk: { ...settings.risk, minConsensusScore } })} step="0.01" />
          <NumberField label="Suporte minimo" value={settings.risk.minSampleSupport} onChange={(minSampleSupport) => setSettings({ ...settings, risk: { ...settings.risk, minSampleSupport } })} />
          <NumberField label="Win rate minimo" value={settings.risk.minEmpiricalWinRate} onChange={(minEmpiricalWinRate) => setSettings({ ...settings, risk: { ...settings.risk, minEmpiricalWinRate } })} />
          <Toggle
            label="Exigir provider real"
            checked={settings.risk.requireRealProvider}
            onChange={(requireRealProvider) => setSettings({ ...settings, risk: { ...settings.risk, requireRealProvider } })}
          />
          <Toggle
            label="Noticias como risk filter only"
            checked={settings.risk.riskFilterOnly}
            onChange={(riskFilterOnly) => setSettings({ ...settings, risk: { ...settings.risk, riskFilterOnly } })}
          />
          <Button onClick={() => void saveRisk()}>Salvar precisao</Button>
        </Card>

        <Card className="space-y-4">
          <div>
            <CardTitle>Browser / setup alvo</CardTitle>
            <CardDescription>O fluxo atual e calibrado para BTC e expiracao de 2 minutos.</CardDescription>
          </div>
          <TextField
            label="URL"
            value={settings.browser.defaultUrl}
            onChange={(defaultUrl) => setSettings({ ...settings, browser: { ...settings.browser, defaultUrl } })}
          />
          <TextField
            label="Ativo alvo"
            value={settings.browser.targetAsset}
            onChange={(targetAsset) => setSettings({ ...settings, browser: { ...settings.browser, targetAsset } })}
          />
          <TextField
            label="Expiracao alvo"
            value={settings.browser.targetExpiry}
            onChange={(targetExpiry) =>
              setSettings({ ...settings, browser: { ...settings.browser, targetExpiry: targetExpiry as AppSettings["browser"]["targetExpiry"] } })
            }
          />
          <Button onClick={() => void saveBrowser()}>Salvar browser</Button>
        </Card>

        {status ? <div className="col-span-2 rounded-xl border border-success/30 bg-success/10 p-3 text-sm text-emerald-200">{status}</div> : null}
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type="number" step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        className="mt-2 h-10 w-full rounded-xl border border-border bg-black/20 px-3 text-sm text-white outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-border bg-black/20 p-3 text-sm">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}
