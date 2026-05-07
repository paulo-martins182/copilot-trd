# Segurança e ética

## Limites do produto

O TradeScope AI é um copiloto analítico. Ele não é recomendação financeira e não garante lucro.

## Restrições implementadas

- Renderer não acessa Node diretamente.
- IPC passa por `contextBridge`.
- IPC usa canais explícitos e valida payloads com Zod.
- `nodeIntegration` fica desativado.
- OpenRouter API Key é criptografada com `safeStorage` quando disponível.
- O app não implementa auto-click, auto-trade ou integração de execução.
- Sinais de alto risco são bloqueados como `AVOID`.
- Mercado incerto é rebaixado para `WAIT`.
- Sinais atrasados são bloqueados.

## Dados locais

- Banco SQLite fica em `app.getPath("userData")`.
- Snapshots ficam em `app.getPath("userData")/snapshots`.
- Frames são enviados à OpenRouter somente quando o copiloto/análise é acionado.

## Riscos conhecidos

- Captura visual pode interpretar gráfico incorretamente.
- Sites podem bloquear Electron ou alterar layout.
- Latência de rede pode tornar sinal inadequado para expiração de 1 minuto.
- Operações binárias têm risco alto e podem perder 100% do valor aplicado.
