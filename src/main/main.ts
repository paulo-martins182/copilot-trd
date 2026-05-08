import { app, BrowserWindow, Menu, session } from "electron";
import { join } from "node:path";
import { createAppContainer } from "./composition/createAppContainer";
import { createWindowIcon } from "./electron/createWindowIcon";
import { registerIpcHandlers } from "./ipc/registerIpcHandlers";

let mainWindow: BrowserWindow | null = null;

async function createMainWindow(): Promise<void> {
  const container = await createAppContainer();

  mainWindow = new BrowserWindow({
    width: 1480,
    height: 920,
    minWidth: 1180,
    minHeight: 760,
    backgroundColor: "#07080c",
    title: "TradeScope AI",
    autoHideMenuBar: true,
    icon: createWindowIcon(),
    webPreferences: {
      preload: join(__dirname, "../preload/preload.mjs"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  container.browserWorkspace.attach(mainWindow);
  registerIpcHandlers(container);
  Menu.setApplicationMenu(null);
  mainWindow.setMenuBarVisibility(false);

  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    callback(["media", "display-capture"].includes(permission));
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  void createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
