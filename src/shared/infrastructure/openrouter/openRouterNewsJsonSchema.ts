export const openRouterNewsJsonSchema = {
  type: "json_schema",
  json_schema: {
    name: "market_context_snapshot",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        marketBias: { type: "string", enum: ["BULLISH", "BEARISH", "NEUTRAL", "MIXED"] },
        riskState: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
        volatilityWarning: { type: "boolean" },
        majorEvents: { type: "array", items: { type: "string" } },
        analysisImpact: { type: "string" },
        expiresAt: { type: "string" }
      },
      required: ["marketBias", "riskState", "volatilityWarning", "majorEvents", "analysisImpact", "expiresAt"]
    }
  }
} as const;
