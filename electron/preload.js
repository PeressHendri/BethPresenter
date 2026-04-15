"use strict";

const { contextBridge, ipcRenderer } = require('electron');
const LAN_SERVER_PORT = 3131;

// Expose Electron APIs to renderer process with security
contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  
  // LAN Server API base URL for remote/display clients
  // useRemoteSync.ts reads this value via getRemoteApiBase()
  // to prefix all /api/local-remote/* fetch calls
  apiBaseUrl: `http://localhost:${LAN_SERVER_PORT}`,
  
  // Display information
  getDisplayInfo: () => ipcRenderer.invoke("display:get-info"),
  
  // Output window lifecycle - main process owns creation, positioning, fullscreen
  openOutputWindow: () => ipcRenderer.invoke("window:open-output"),
  closeOutputWindow: () => ipcRenderer.invoke("window:close-output"),
  isOutputWindowOpen: () => ipcRenderer.invoke("window:is-output-open"),
  focusOutputWindow: () => ipcRenderer.invoke("window:focus-output"),
  onOutputClosed: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("output-window-closed", handler);
    // Return cleanup function
    return () => ipcRenderer.removeListener("output-window-closed", handler);
  },
  
  setOutputFullscreen: (value) => ipcRenderer.invoke("window:set-fullscreen", value),
  isOutputFullscreen: () => ipcRenderer.invoke("window:is-fullscreen"),
  
  // Database operations with quota management
  db: {
    checkQuota: () => ipcRenderer.invoke("db:checkQuota"),
    addItem: (storeName, item) => ipcRenderer.invoke("db:addItem", storeName, item),
    updateItem: (storeName, item) => ipcRenderer.invoke("db:updateItem", storeName, item),
    getItem: (storeName, id) => ipcRenderer.invoke("db:getItem", storeName, id),
    getAllItems: (storeName) => ipcRenderer.invoke("db:getAllItems", storeName),
    deleteItem: (storeName, id) => ipcRenderer.invoke("db:deleteItem", storeName, id),
    clearStore: (storeName) => ipcRenderer.invoke("db:clearStore", storeName),
    
    // Blob storage for media files
    saveBlob: async (id, blob) => {
      const bytes = new Uint8Array(await blob.arrayBuffer());
      return ipcRenderer.invoke("db:saveBlob", {
        id,
        bytes,
        type: blob.type,
        size: blob.size,
        savedAt: Date.now()
      });
    },
    getBlob: async (id) => {
      const payload = await ipcRenderer.invoke("db:getBlob", id);
      if (!payload?.bytes) return null;
      const bytes = payload.bytes instanceof Uint8Array ? payload.bytes : new Uint8Array(payload.bytes);
      return new Blob([bytes], { type: payload.type || "" });
    },
    hasBlob: (id) => ipcRenderer.invoke("db:hasBlob", id),
    deleteBlob: (id) => ipcRenderer.invoke("db:deleteBlob", id),
    getAllBlobInfo: () => ipcRenderer.invoke("db:getAllBlobInfo"),
    autoEvict: (bytesNeeded) => ipcRenderer.invoke("db:autoEvict", bytesNeeded)
  },
  
  // Bible management
  bible: {
    save: (meta, dataJson) => ipcRenderer.invoke("bible:save", meta, dataJson),
    list: () => ipcRenderer.invoke("bible:list"),
    load: (id) => ipcRenderer.invoke("bible:load", id),
    delete: (id) => ipcRenderer.invoke("bible:delete", id)
  },
  
  // File dialogs and operations
  browseLocalMedia: () => ipcRenderer.invoke("dialog:browseLocalMedia"),
  browsePptx: () => ipcRenderer.invoke("dialog:browsePptx"),
  parsePptx: (filePath) => ipcRenderer.invoke("pptx:parse", filePath),
  
  // Window operations
  reloadWindow: () => ipcRenderer.send("window:reload"),
  
  // License management
  license: {
    getStatus: () => ipcRenderer.invoke("license:get-status"),
    activate: (key) => ipcRenderer.invoke("license:activate", key),
    getHardwareId: () => ipcRenderer.invoke("license:get-hardware-id"),
    resetTrial: () => ipcRenderer.invoke("license:reset-trial"),
    deactivate: () => ipcRenderer.invoke("license:deactivate")
  },
  
  // Auto-update system
  update: {
    check: () => ipcRenderer.invoke("update:check"),
    download: () => ipcRenderer.invoke("update:download"),
    install: () => ipcRenderer.invoke("update:install"),
    onAvailable: (callback) => {
      ipcRenderer.on("update:available", (_event, info) => callback(info));
    },
    onProgress: (callback) => {
      ipcRenderer.on("update:download-progress", (_event, progress) => callback(progress));
    },
    onDownloaded: (callback) => {
      ipcRenderer.on("update:downloaded", () => callback());
    },
    onError: (callback) => {
      ipcRenderer.on("update:error", (_event, msg) => callback(msg));
    }
  }
});

// Console logging for debugging (remove in production)
if (process.env.NODE_ENV === 'development') {
  console.log('BethPresenter preload script loaded');
  console.log('Electron API exposed to renderer process');
}
