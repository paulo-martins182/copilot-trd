export const openRouterAnalysisResponseFormat = {
  type: "json_schema",
  json_schema: {
    name: "trade_scope_analysis",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        signal: {
          type: "string",
          enum: ["BUY", "SELL", "WAIT", "AVOID"],
          description: "Sinal analítico conservador. BUY/SELL somente com confirmação visual forte."
        },
        confidence: {
          type: "integer",
          minimum: 0,
          maximum: 100,
          description: "Confiança visual conservadora, nunca inflada."
        },
        riskLevel: {
          type: "string",
          enum: ["LOW", "MEDIUM", "HIGH"],
          description: "Risco da entrada considerando volatilidade, lateralização e falta de confirmação."
        },
        marketCondition: {
          type: "string",
          enum: ["TRENDING", "RANGING", "VOLATILE", "UNCLEAR"],
          description: "Condição visual principal do mercado."
        },
        suggestedExpiry: {
          type: "string",
          enum: ["ONE_MINUTE", "TWO_MINUTES", "FIVE_MINUTES", "NONE"],
          description: "Expiração sugerida; NONE quando não houver entrada clara."
        },
        reasoning: {
          type: "string",
          description: "Explicação curta em português."
        },
        checklist: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              label: {
                type: "string",
                description: "Critério visual avaliado."
              },
              passed: {
                type: "boolean",
                description: "Se o critério foi atendido."
              }
            },
            required: ["label", "passed"]
          },
          description: "Checklist visual da leitura do gráfico."
        },
        warning: {
          type: "string",
          description: "Aviso curto de risco."
        }
      },
      required: [
        "signal",
        "confidence",
        "riskLevel",
        "marketCondition",
        "suggestedExpiry",
        "reasoning",
        "checklist",
        "warning"
      ]
    }
  }
} as const;
