import { z } from "zod";

export const signalSchema = z.enum(["BUY", "SELL", "WAIT", "AVOID"]);
export const riskLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);
export const marketConditionSchema = z.enum(["TRENDING", "RANGING", "VOLATILE", "UNCLEAR"]);
export const suggestedExpirySchema = z.enum(["ONE_MINUTE", "TWO_MINUTES", "FIVE_MINUTES", "NONE"]);

export const captureRegionSchema = z.object({
  x: z.number().finite().min(0),
  y: z.number().finite().min(0),
  width: z.number().finite().positive(),
  height: z.number().finite().positive()
});

export const frameMetadataSchema = z.object({
  sourceType: z.enum(["BROWSER", "SCREEN"]),
  sourceId: z.string().min(1),
  region: captureRegionSchema,
  capturedAt: z.string().datetime()
});

export const aiAnalysisSchema = z.object({
  signal: signalSchema,
  confidence: z.number().int().min(0).max(100),
  riskLevel: riskLevelSchema,
  marketCondition: marketConditionSchema,
  suggestedExpiry: suggestedExpirySchema,
  reasoning: z.string().min(1).max(800),
  checklist: z.array(
    z.object({
      label: z.string().min(1).max(120),
      passed: z.boolean()
    })
  ).min(1).max(8),
  warning: z.string().min(1).max(500)
});

export const browserBoundsSchema = z.object({
  x: z.number().finite().min(0),
  y: z.number().finite().min(0),
  width: z.number().finite().min(0),
  height: z.number().finite().min(0)
});

export const browserVisibleSchema = z.object({
  visible: z.boolean()
});

export const analyzeFrameRequestSchema = z.object({
  dataUrl: z.string().startsWith("data:image/"),
  metadata: frameMetadataSchema
});

export const riskSettingsSchema = z.object({
  bankroll: z.number().finite().min(0),
  riskPercent: z.number().finite().min(0).max(5),
  maxStake: z.number().finite().min(0),
  minConfidence: z.number().int().min(1).max(100),
  staleAfterMs: z.number().int().min(250).max(10000),
  maxOneMinuteLatencyMs: z.number().int().min(100).max(5000),
  alertCooldownMs: z.number().int().min(1000).max(120000),
  enabledExpiries: z.array(suggestedExpirySchema).min(1),
  requireRealProvider: z.boolean(),
  riskFilterOnly: z.boolean(),
  consensusWindowSize: z.number().int().min(3).max(9),
  minConsensusScore: z.number().min(0).max(1),
  minSampleSupport: z.number().int().min(0).max(500),
  minEmpiricalWinRate: z.number().int().min(0).max(100)
});

export const aiSettingsSchema = z.object({
  provider: z.enum(["OPENROUTER", "GOOGLE"]),
  openRouterApiKey: z.string().optional(),
  googleApiKey: z.string().optional(),
  model: z.string().min(1),
  fallbackModel: z.string().min(1),
  useMockProvider: z.boolean()
});

export const openRouterSettingsSchema = aiSettingsSchema;

export const browserSettingsSchema = z.object({
  defaultUrl: z.string().url(),
  targetAsset: z.string().min(1),
  targetExpiry: suggestedExpirySchema
});

export const tradeJournalCreateSchema = z.object({
  analysisId: z.string().optional(),
  asset: z.string().min(1).max(80),
  entryType: signalSchema,
  entryTime: z.string().datetime(),
  result: z.enum(["WIN", "LOSS", "DOJI"]),
  stake: z.number().finite().min(0),
  payout: z.number().finite().min(0).optional(),
  notes: z.string().max(1000),
  screenshotPath: z.string().optional()
});

export const loadUrlSchema = z.object({
  url: z.string().url()
});

export const historyRequestSchema = z.object({
  limit: z.number().int().min(1).max(500).default(100)
});

export const idRequestSchema = z.object({
  id: z.string().min(1)
});

export const setupLabelRequestSchema = z.object({
  setupLabel: z.string().min(1)
});
