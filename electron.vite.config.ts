import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        "@main": resolve("src/main"),
        "@shared": resolve("src/shared")
      }
    },
    build: {
      rollupOptions: {
        input: resolve("src/main/main.ts")
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        "@shared": resolve("src/shared")
      }
    },
    build: {
      rollupOptions: {
        input: resolve("src/preload/preload.ts")
      }
    }
  },
  renderer: {
    plugins: [react()],
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer"),
        "@shared": resolve("src/shared")
      }
    },
    build: {
      rollupOptions: {
        input: resolve("src/renderer/index.html")
      }
    }
  }
});
