import { contextBridge, ipcRenderer } from "electron";
import type { TradeScopeAPI } from "@shared/presentation/dtos/api";
import { channels } from "../main/ipc/channels";

const api: TradeScopeAPI = {
  browser: {
    loadUrl: (input) => ipcRenderer.invoke(channels.browserLoadUrl, input) as Promise<void>,
    setBounds: (bounds) => ipcRenderer.invoke(channels.browserSetBounds, bounds) as Promise<void>,
    captureRegion: (region) => ipcRenderer.invoke(channels.browserCaptureRegion, region) as ReturnType<TradeScopeAPI["browser"]["captureRegion"]>,
    setVisible: (input) => ipcRenderer.invoke(channels.browserSetVisible, input) as Promise<void>
  },
  capture: {
    listSources: () => ipcRenderer.invoke(channels.captureListSources) as ReturnType<TradeScopeAPI["capture"]["listSources"]>
  },
  analysis: {
    analyzeFrame: (input) => ipcRenderer.invoke(channels.analysisAnalyzeFrame, input) as ReturnType<TradeScopeAPI["analysis"]["analyzeFrame"]>,
    getHistory: (input) => ipcRenderer.invoke(channels.analysisGetHistory, input ?? {}) as ReturnType<TradeScopeAPI["analysis"]["getHistory"]>,
    getById: (input) => ipcRenderer.invoke(channels.analysisGetById, input) as ReturnType<TradeScopeAPI["analysis"]["getById"]>
  },
  settings: {
    getAll: () => ipcRenderer.invoke(channels.settingsGetAll) as ReturnType<TradeScopeAPI["settings"]["getAll"]>,
    updateRisk: (settings) => ipcRenderer.invoke(channels.settingsUpdateRisk, settings) as ReturnType<TradeScopeAPI["settings"]["updateRisk"]>,
    updateOpenRouter: (settings) =>
      ipcRenderer.invoke(channels.settingsUpdateOpenRouter, settings) as ReturnType<TradeScopeAPI["settings"]["updateOpenRouter"]>,
    updateBrowser: (settings) => ipcRenderer.invoke(channels.settingsUpdateBrowser, settings) as ReturnType<TradeScopeAPI["settings"]["updateBrowser"]>
  },
  journal: {
    create: (input) => ipcRenderer.invoke(channels.journalCreate, input) as Promise<void>,
    list: (input) => ipcRenderer.invoke(channels.journalList, input ?? {}) as ReturnType<TradeScopeAPI["journal"]["list"]>,
    metrics: () => ipcRenderer.invoke(channels.journalMetrics) as ReturnType<TradeScopeAPI["journal"]["metrics"]>
  }
};

contextBridge.exposeInMainWorld("tradeScope", api);
