/// <reference types="vite/client" />

import type { TradeScopeAPI } from "@shared/presentation/dtos/api";

declare global {
  interface Window {
    tradeScope: TradeScopeAPI;
  }
}
