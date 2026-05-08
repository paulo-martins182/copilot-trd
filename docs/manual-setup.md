# Setup manual

## Requisitos

- Node.js LTS.
- Windows, macOS ou Linux com suporte a Electron.
- API key de um provider suportado:
  - OpenRouter
  - Google AI (Gemini)

## Instalacao

```bash
npm install
npm run dev
```

## Uso com mock

Sem API key, o provider mock retorna sinais demonstrativos para validar o fluxo.
Esse modo nao analisa o mercado real.

## Uso com provider real

1. Abra `Configuracoes`.
2. Escolha `OpenRouter` ou `Google AI (Gemini)`.
3. Desative `Usar provider mockavel`.
4. Informe a API key do provider selecionado.
5. Escolha `Modelo principal` e `Fallback`.
6. Salve.
7. Ative o copiloto no Browser Copilot.

### OpenRouter free

- Modelo principal padrao: `google/gemma-4-26b-a4b-it:free`
- Fallback padrao: `google/gemma-4-31b-it:free`
- `openrouter/free` fica melhor como ultimo fallback do que como principal.

### Google AI (Gemini)

- Use uma API key do Google AI Studio / Gemini API.
- A UI expoe modelos Gemini com suporte a visao e structured output.

## Latencia

Para operacoes de 1 minuto, sinais acima do limite configurado sao bloqueados ou ajustados.
Essa protecao existe porque sinal atrasado e pior que ausencia de sinal.
