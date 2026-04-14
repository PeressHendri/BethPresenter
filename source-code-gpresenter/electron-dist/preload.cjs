"use strict";

// electron/preload.ts
var import_electron = require("electron");
var LAN_SERVER_PORT = 3131;
import_electron.contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  // useRemoteSync.ts reads this value via getRemoteApiBase()
  // to prefix all /api/local-remote/* fetch calls
  apiBaseUrl: `http://localhost:${LAN_SERVER_PORT}`,
  getDisplayInfo: () => import_electron.ipcRenderer.invoke("display:get-info"),
  // Output window lifecycle — main process owns creation, positioning, fullscreen
  openOutputWindow: () => import_electron.ipcRenderer.invoke("window:open-output"),
  closeOutputWindow: () => import_electron.ipcRenderer.invoke("window:close-output"),
  isOutputWindowOpen: () => import_electron.ipcRenderer.invoke("window:is-output-open"),
  focusOutputWindow: () => import_electron.ipcRenderer.invoke("window:focus-output"),
  // Push notification from main when output window is closed (e.g., Alt+F4)
  onOutputClosed: (callback) => {
    import_electron.ipcRenderer.on("output-window-closed", () => callback());
  },
  setOutputFullscreen: (value) => import_electron.ipcRenderer.invoke("window:set-fullscreen", value),
  isOutputFullscreen: () => import_electron.ipcRenderer.invoke("window:is-fullscreen"),
  db: {
    checkQuota: () => import_electron.ipcRenderer.invoke("db:checkQuota"),
    addItem: (storeName, item) => import_electron.ipcRenderer.invoke("db:addItem", storeName, item),
    updateItem: (storeName, item) => import_electron.ipcRenderer.invoke("db:updateItem", storeName, item),
    getItem: (storeName, id) => import_electron.ipcRenderer.invoke("db:getItem", storeName, id),
    getAllItems: (storeName) => import_electron.ipcRenderer.invoke("db:getAllItems", storeName),
    deleteItem: (storeName, id) => import_electron.ipcRenderer.invoke("db:deleteItem", storeName, id),
    clearStore: (storeName) => import_electron.ipcRenderer.invoke("db:clearStore", storeName),
    saveBlob: async (id, blob) => {
      const bytes = new Uint8Array(await blob.arrayBuffer());
      return import_electron.ipcRenderer.invoke("db:saveBlob", {
        id,
        bytes,
        type: blob.type,
        size: blob.size,
        savedAt: Date.now()
      });
    },
    getBlob: async (id) => {
      const payload = await import_electron.ipcRenderer.invoke("db:getBlob", id);
      if (!payload?.bytes) return null;
      const bytes = payload.bytes instanceof Uint8Array ? payload.bytes : new Uint8Array(payload.bytes);
      return new Blob([bytes], { type: payload.type || "" });
    },
    hasBlob: (id) => import_electron.ipcRenderer.invoke("db:hasBlob", id),
    deleteBlob: (id) => import_electron.ipcRenderer.invoke("db:deleteBlob", id),
    getAllBlobInfo: () => import_electron.ipcRenderer.invoke("db:getAllBlobInfo"),
    autoEvict: (bytesNeeded) => import_electron.ipcRenderer.invoke("db:autoEvict", bytesNeeded)
  },
  bible: {
    save: (meta, dataJson) => import_electron.ipcRenderer.invoke("bible:save", meta, dataJson),
    list: () => import_electron.ipcRenderer.invoke("bible:list"),
    load: (id) => import_electron.ipcRenderer.invoke("bible:load", id),
    delete: (id) => import_electron.ipcRenderer.invoke("bible:delete", id)
  },
  browseLocalMedia: () => import_electron.ipcRenderer.invoke("dialog:browseLocalMedia"),
  browsePptx: () => import_electron.ipcRenderer.invoke("dialog:browsePptx"),
  parsePptx: (filePath) => import_electron.ipcRenderer.invoke("pptx:parse", filePath),
  reloadWindow: () => import_electron.ipcRenderer.send("window:reload"),
  license: {
    getStatus: () => import_electron.ipcRenderer.invoke("license:get-status"),
    activate: (key) => import_electron.ipcRenderer.invoke("license:activate", key),
    getHardwareId: () => import_electron.ipcRenderer.invoke("license:get-hardware-id"),
    resetTrial: () => import_electron.ipcRenderer.invoke("license:reset-trial"),
    deactivate: () => import_electron.ipcRenderer.invoke("license:deactivate")
  },
  update: {
    check: () => import_electron.ipcRenderer.invoke("update:check"),
    download: () => import_electron.ipcRenderer.invoke("update:download"),
    install: () => import_electron.ipcRenderer.invoke("update:install"),
    onAvailable: (callback) => {
      import_electron.ipcRenderer.on("update:available", (_event, info) => callback(info));
    },
    onProgress: (callback) => {
      import_electron.ipcRenderer.on("update:download-progress", (_event, progress) => callback(progress));
    },
    onDownloaded: (callback) => {
      import_electron.ipcRenderer.on("update:downloaded", () => callback());
    },
    onError: (callback) => {
      import_electron.ipcRenderer.on("update:error", (_event, msg) => callback(msg));
    }
  }
});
