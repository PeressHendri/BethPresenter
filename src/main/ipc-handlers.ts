import { ipcMain, BrowserWindow, powerSaveBlocker, dialog } from 'electron';
import path from 'path';
import { startRemoteServer, stopRemoteServer, broadcastState, sendToClient } from './remoteServer';
import { getMediaLibrary, importMedia, deleteMedia, getStorageInfo } from './media';
import { initBible, getTranslations, getBooks, getVerses, searchReference } from './bible';

let outputWindow: BrowserWindow | null = null;
let stageWindow: BrowserWindow | null = null;
let wakeLockId: number | null = null;
let isStageConnected = false;

export function setupIpcHandlers() {
  const getOutput = () => outputWindow;
  const getStage = () => stageWindow;

  // ── WINDOW MANAGEMENT ──
  ipcMain.handle('output-open', async () => {
    if (outputWindow) { outputWindow.focus(); return { success: true }; }
    outputWindow = new BrowserWindow({
      width: 1920, height: 1080, title: 'BethPresenter Output',
      backgroundColor: '#000000', autoHideMenuBar: true,
      webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
    });
    outputWindow.on('closed', () => outputWindow = null);
    return { success: true };
  });

  ipcMain.handle('output-close', () => { outputWindow?.close(); return { success: true }; });
  ipcMain.handle('output-blank', (event, state: boolean) => {
    getOutput()?.webContents.send('output:blank-state', state);
    return { success: true };
  });

  ipcMain.handle('output-fullscreen', () => {
    const win = getOutput();
    if (win) {
      win.setFullScreen(!win.isFullScreen());
      return { success: true, isFullScreen: win.isFullScreen() };
    }
    return { success: false };
  });

  // ── STAGE DISPLAY ORCHESTRATION ──
  ipcMain.handle('stage-display-open', async () => {
    if (stageWindow) { stageWindow.focus(); return { success: true }; }
    stageWindow = new BrowserWindow({
      width: 1280, height: 720, title: 'BethPresenter Stage Monitor',
      backgroundColor: '#000000', autoHideMenuBar: true,
      webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
    });
    stageWindow.on('closed', () => { stageWindow = null; isStageConnected = false; });
    return { success: true };
  });

  ipcMain.handle('stage-report-connection', (event, connected: boolean) => {
    isStageConnected = connected;
    BrowserWindow.getAllWindows().forEach(win => win.webContents.send('stage:status-update', connected));
    return { success: true };
  });

  ipcMain.handle('stage-check-connection', () => isStageConnected);

  ipcMain.handle('stage-send-message', (event, data: any) => {
    getStage()?.webContents.send('stage:receive-message', data);
    return { success: true };
  });

  ipcMain.handle('stage-clear-message', () => {
    getStage()?.webContents.send('stage:clear-message');
    return { success: true };
  });

  ipcMain.handle('stage-toggle-lyrics', (event, visible: boolean) => {
    getStage()?.webContents.send('stage:toggle-lyrics', visible);
    return { success: true };
  });

  ipcMain.handle('stage-style-update', (event, style: any) => {
    getStage()?.webContents.send('stage:update-style', style);
    return { success: true };
  });

  // ── MEDIA ENGINE ──
  ipcMain.handle('media-library-load', () => getMediaLibrary());
  ipcMain.handle('media-import', (event, paths?: string[]) => importMedia(paths));
  ipcMain.handle('media-delete', (event, id: string) => deleteMedia(id));
  ipcMain.handle('media-storage-info', () => getStorageInfo());
  ipcMain.handle('media-apply-background', (event, media: any) => {
    getOutput()?.webContents.send('output:set-background', media);
    return { success: true };
  });

  // ── REMOTE CONTROL ──
  ipcMain.handle('remote-server-start', async (event, port: number = 8080) => {
    try {
      const data = await startRemoteServer(port, {
        onSlideChange: (d) => BrowserWindow.getAllWindows().forEach(win => win.webContents.send('remote:control-slide', d)),
        onBlankToggle: (b) => BrowserWindow.getAllWindows().forEach(win => win.webContents.send('remote:control-blank', b)),
        onSendBible: (b) => BrowserWindow.getAllWindows().forEach(win => win.webContents.send('remote:control-bible', b))
      });
      return { success: true, ...data };
    } catch (err: any) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('remote-server-stop', () => stopRemoteServer());
  ipcMain.handle('remote-broadcast-state', (event, state) => { broadcastState(state); return { success: true }; });
  ipcMain.handle('remote-send-to-socket', (event, d) => { sendToClient(d.socketId, d.eventName, d.data); return { success: true }; });

  // ── COUNTDOWN ──
  ipcMain.handle('countdown:start', (event, d) => {
    getOutput()?.webContents.send('output:countdown-start', d);
    getStage()?.webContents.send('stage:countdown-start', d);
    return { success: true };
  });
  ipcMain.handle('countdown:pause', () => {
    getOutput()?.webContents.send('output:countdown-pause');
    getStage()?.webContents.send('stage:countdown-pause');
    return { success: true };
  });
  ipcMain.handle('countdown:reset', () => {
    getOutput()?.webContents.send('output:countdown-reset');
    getStage()?.webContents.send('stage:countdown-reset');
    return { success: true };
  });

  // ── CORE PRODUCTION ──
  ipcMain.handle('slide-live', (event, slide) => {
    getOutput()?.webContents.send('output:render', slide);
    getStage()?.webContents.send('stage:update-slide', { current: slide });
    return { success: true };
  });
  
  ipcMain.handle('presentation-end-live', () => {
    getOutput()?.webContents.send('output:clear');
    return { success: true };
  });

  // ── SCRIPTURE ENGINE ──
  initBible();

  ipcMain.handle('scripture-load-translations', () => getTranslations());
  ipcMain.handle('scripture-load-books', () => getBooks());
  ipcMain.handle('scripture-load-verses', (event, { book, chapter, translation }) => 
    getVerses(book, chapter, translation)
  );
  ipcMain.handle('scripture-search-reference', (event, query) => searchReference(query));

  // ── MOCK/DEPRECATED ──
  ipcMain.handle('setting:get', (event, key) => 'A'); // Mock stage layout as A
}
