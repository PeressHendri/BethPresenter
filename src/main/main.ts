import { app, BrowserWindow, ipcMain, Menu, protocol, net, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';
import { setupIpcHandlers } from './ipc-handlers';
import { createOutputWindow, getOutputWindow } from './output-window';
import { createStageWindow, getStageWindow, closeStageWindow } from './stageWindow';

let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;

// ==============================================================
// DevOps Configurations: Loggers & Auto Updater Integrations
// ==============================================================
let log: any;
let autoUpdater: any;

try {
  log = require('electron-log');
  log.transports.file.level = 'info';
  Object.assign(console, log.functions);
} catch (e) {
  console.log('electron-log not installed. Using standard console.');
}

try {
  const updaterModule = require('electron-updater');
  autoUpdater = updaterModule.autoUpdater;
  if (log) autoUpdater.logger = log;
  autoUpdater.autoDownload = false; // Give user choice via IPC
} catch (e) {
  console.log('electron-updater not installed. Skipping OTA updates.');
}

// Global Exception Safeties
process.on('uncaughtException', (error) => {
  if (log) log.error('UNCAUGHT EXCEPTION:', error);
  else console.error('UNCAUGHT EXCEPTION:', error);
});
process.on('unhandledRejection', (reason) => {
  if (log) log.error('UNHANDLED REJECTION:', reason);
  else console.error('UNHANDLED REJECTION:', reason);
});

// ---------------------------------------------------------------------------
// Register custom "media://" protocol BEFORE app is ready
// ---------------------------------------------------------------------------
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'media',
    privileges: {
      secure: true,
      supportFetchAPI: true,
      bypassCSP: false,
      stream: true,
    },
  },
]);

const createSplash = () => {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    webPreferences: { nodeIntegration: false, contextIsolation: true }
  });

  // Simple Base64 HTML splash to prevent needing external static files on cold boot
  splashWindow.loadURL(`data:text/html;charset=utf-8,
    <html>
      <body style="font-family: sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; background: radial-gradient(circle, %231e293b 0%25, %230f172a 100%25); color:white; height:100vh; margin:0; border-radius: 12px; overflow: hidden; border: 1px solid %23334155;">
         <h1 style="font-size:32px; margin:0; font-weight:900; letter-spacing:-1px;">BethPresenter</h1>
         <p style="color:%2394a3b8; font-size:12px; letter-spacing:4px; text-transform:uppercase; margin-bottom: 24px;">Youth Bethlehem</p>
         <div style="width: 200px; height: 4px; background: %23334155; border-radius: 4px; overflow: hidden;">
            <div style="width: 100%25; height: 100%25; background: %236366f1; animation: loading 1.5s infinite;"></div>
         </div>
         <style>@keyframes loading { 0%25 { transform: translateX(-100%25); } 100%25 { transform: translateX(100%25); } }</style>
         <p style="color:%2364748b; font-size:10px; margin-top:20px;">Memuat Database & Modul Presentasi...</p>
      </body>
    </html>
  `);
};

const createWindow = () => {
  const iconPath = process.env.VITE_DEV_SERVER_URL
    ? path.resolve(__dirname, '../../assets/logo.png')
    : path.join(path.dirname(app.getPath('exe')), 'assets', 'logo.png');

  mainWindow = new BrowserWindow({
    width: 1360,
    height: 840,
    minWidth: 1024,
    minHeight: 700,
    frame: false,        // Custom TitleBar
    titleBarStyle: 'hidden',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  });

  // ── App menu with Stage Display & Remote Control ──
  const menuTemplate: any = [
    {
      label: 'File',
      submenu: [{ role: 'quit' }],
    },
    {
      label: 'Windows',
      submenu: [
        {
          label: 'Output Window',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => {
            const w = getOutputWindow();
            if (w) { w.show(); w.focus(); } else { createOutputWindow(); }
          },
        },
        {
          label: 'Stage Display',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            const w = getStageWindow();
            if (w) { w.show(); w.focus(); } else { createStageWindow(); }
          },
        },
        { type: 'separator' },
        {
          label: 'Close Stage Display',
          click: () => closeStageWindow(),
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow?.loadURL(process.env.VITE_DEV_SERVER_URL);
    // DevTools disabled automatically
  } else {
    mainWindow?.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow?.once('ready-to-show', () => {
     if (splashWindow) {
        splashWindow.close();
        splashWindow = null;
     }
     mainWindow?.show();
     
     // Trigger AutoUpdater Checks on load silently
     if (autoUpdater && !process.env.VITE_DEV_SERVER_URL) {
        autoUpdater.checkForUpdates().catch((e: any) => console.log('Update check error', e));
     }
  });

  // Crashed WebContents Recovery
  mainWindow?.webContents.on('render-process-gone', (_, details) => {
     if (log) log.error('Main window renderer crashed!', details);
     dialog.showMessageBox({
        title: 'Crash Report',
        message: 'Panel Utama mengalami kegagalan RAM/GPU dan ditutup sistem secara paksa.',
        buttons: ['Refresh Ulang Sistem']
     }).then(() => {
        mainWindow?.reload();
     });
  });
};

app.on('ready', () => {
  createSplash(); // Show Splash Immediately

  // Register media:// protocol
  protocol.handle('media', (request) => {
    const filePath = decodeURIComponent(request.url.replace('media://', ''));
    return net.fetch(pathToFileURL(filePath).toString());
  });

  setupIpcHandlers(ipcMain, getOutputWindow, createOutputWindow, getStageWindow, createStageWindow);
  
  // Fake brief timeout so the user actually sees the beautiful Splash Loader initializing backend models
  setTimeout(() => {
     createWindow();
     createOutputWindow(); // Spawn invisible output
  }, 1200);

  /* ── Custom TitleBar IPC ── */
  ipcMain.handle('window:minimize', () => mainWindow?.minimize());
  ipcMain.handle('window:maximize-toggle', () => {
    if (!mainWindow) return;
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });
  ipcMain.handle('window:close', () => mainWindow?.close());

  /* Custom AutoUpdate Hook listeners */
  autoUpdater?.on('update-available', (info: any) => {
     mainWindow?.webContents.send('updater:available', info);
  });
  autoUpdater?.on('update-downloaded', () => {
     mainWindow?.webContents.send('updater:ready');
  });
  ipcMain.on('updater:apply', () => autoUpdater?.quitAndInstall());

  /* IPC log relay from Client */
  ipcMain.on('log:error', (_, data) => {
     if (log) log.error('[CLIENT UI ERROR]', data.error, data.stack);
  });

  /* Notify renderer when maximize state changes */
  mainWindow?.on('maximize',   () => mainWindow?.webContents.send('window:maximized-state', true));
  mainWindow?.on('unmaximize', () => mainWindow?.webContents.send('window:maximized-state', false));
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
