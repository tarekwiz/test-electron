import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import fs from "fs";

const pathConfig = path.join(app.getAppPath(), "config.json");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const getPath = () => {
  return app.getAppPath();
};
const getConfig = () => {
  const data = fs.readFileSync(pathConfig, "utf8");
  const config = JSON.parse(data);
  return config;
};
const setConfig = (config: any) => {
  fs.writeFileSync(pathConfig, JSON.stringify(config));
};

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  ipcMain.on("setUrl", (event, url) => {
    setConfig({ url });
    mainWindow.loadURL(url);
  });

  ipcMain.on("getPath", (event) => {
    event.returnValue = getPath();
  });

  //read file config.json
  try {
    const { url } = getConfig();
    mainWindow.loadURL(url);
  } catch {
    //ask user to input url
    mainWindow.loadFile("index.html");
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
