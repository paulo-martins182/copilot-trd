export const openRouterShadowOutcomeJsonSchema = {
  type: "json_schema",
  json_schema: {
    name: "shadow_outcome",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        outcome: { type: "string", enum: ["WIN", "LOSS", "UNCLEAR"] },
        reason: { type: "string" }
      },
      required: ["outcome", "reason"]
    }
  }
} as const;
