# Arquitetura

## Visão geral

O TradeScope AI usa Clean Architecture com Electron como composition root.

```text
src/
  main/                  Electron, WebContentsView, IPC e captura
  preload/               contextBridge seguro
  renderer/              React, páginas e componentes compostos
  shared/
    domain/              entidades, contratos e serviços
    application/         casos de uso
    infrastructure/      OpenRouter, SQLite e rule engine
    presentation/        DTOs e validação Zod
```

## Fluxo do copiloto

1. `WebContentsView` carrega o TradingView.
2. Usuário define a região do gráfico.
3. Renderer aciona captura a cada 2s.
4. Main process captura a região com `capturePage`.
5. Frame é salvo como snapshot local.
6. OpenRouter retorna JSON estruturado usando modelo vision free.
7. `ConservativeRiskRuleEngine` decide sinal final.
8. UI alerta apenas `BUY`/`SELL` aprovados.

## Decisão de latência

Cada análise armazena `capturedAt`, `analyzedAt`, `latencyMs` e `isStale`.
Se o sinal estiver atrasado, o rule engine bloqueia ou ajusta a expiração.

## Contratos principais

- `ScreenCaptureProvider`
- `AIAnalysisProvider`
- `AnalysisRepository`
- `TradeJournalRepository`
- `RiskRuleEngine`
- `SettingsRepository`
- `StakeSizingService`

## Provider de IA

O MVP usa `OpenRouterVisionProvider` com `google/gemma-4-31b-it:free` como padrão e `openrouter/free` como fallback.
O rule engine local continua sendo a barreira principal para impedir entradas ruins.
