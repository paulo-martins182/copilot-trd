export const channels = {
  browserLoadUrl: "browser:load-url",
  browserSetBounds: "browser:set-bounds",
  browserCaptureRegion: "browser:capture-region",
  browserSetVisible: "browser:set-visible",
  captureListSources: "capture:list-sources",
  analysisAnalyzeFrame: "analysis:analyze-frame",
  analysisGetHistory: "analysis:get-history",
  analysisGetById: "analysis:get-by-id",
  settingsGetAll: "settings:get-all",
  settingsUpdateRisk: "settings:update-risk",
  settingsUpdateOpenRouter: "settings:update-openrouter",
  settingsUpdateBrowser: "settings:update-browser",
  journalCreate: "journal:create",
  journalList: "journal:list",
  journalMetrics: "journal:metrics"
} as const;
