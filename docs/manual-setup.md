# Setup manual

## Requisitos

- Node.js LTS.
- Windows, macOS ou Linux com suporte a Electron.
- Conta OpenRouter com API Key para análise visual real via modelos free.

## Instalação

```bash
npm install
npm run dev
```

Se `better-sqlite3` falhar no Windows, rode:

```bash
npm run postinstall
```

## Uso com mock

Sem API Key, o provider mock retorna sinais demonstrativos para validar o fluxo.
Esse modo não analisa o mercado real.

## Uso com OpenRouter free

1. Abra `Configurações`.
2. Desative `Usar provider mockável`.
3. Informe a OpenRouter API Key.
4. Salve.
5. Ative o copiloto no Browser Copilot.

Modelo padrão: `google/gemma-4-31b-it:free`.
Fallback padrão: `openrouter/free`.

## Latência

Para operações de 1 minuto, sinais acima do limite configurado são bloqueados ou ajustados.
Essa proteção existe porque sinal atrasado é pior que ausência de sinal.
