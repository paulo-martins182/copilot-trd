# TradeScope AI

MVP desktop em Electron + React para atuar como copiloto analítico visual em gráficos de operações binárias.

## O que o MVP faz

- Abre o TradingView dentro do app usando `WebContentsView`.
- Captura uma região do gráfico via `webContents.capturePage(rect)`.
- Envia frames para OpenRouter usando modelos vision free com JSON estruturado.
- Aplica regras locais conservadoras antes de exibir qualquer sinal.
- Emite alerta visual + som para `BUY`/`SELL` aprovados.
- Sugere expiração `1m`, `2m` ou `5m` e valor máximo baseado em risco configurado.
- Salva análises, snapshots e registros manuais em SQLite local.

## O que o MVP não faz

- Não opera automaticamente.
- Não clica em botões.
- Não integra com corretoras para executar ordens.
- Não promete lucro ou assertividade.
- Não recomenda martingale ou recuperação de perdas.

## Comandos

```bash
npm install
npm run dev
npm test
npm run build
```

## Configuração rápida

1. Abra `Configurações`.
2. Informe `OPENROUTER_API_KEY` na tela ou deixe vazio para usar provider mock.
3. Ajuste banca, risco por operação, confiança mínima e latência máxima.
4. Abra `Browser Copilot`.
5. Confirme a URL do TradingView.
6. Ajuste a região do gráfico e clique em `Ativar copiloto`.

## IA free via OpenRouter

- Modelo principal padrão: `google/gemma-4-31b-it:free`.
- Fallback padrão: `openrouter/free`, que filtra modelos free compatíveis com visão/structured outputs quando possível.
- Free tiers podem ter rate limits, indisponibilidade temporária e latência maior.

## Segurança

Leia `docs/security.md` antes de usar em ambiente real.
# copilot-trd
