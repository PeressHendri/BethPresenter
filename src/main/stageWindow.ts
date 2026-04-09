import { BrowserWindow, screen } from 'electron';
import path from 'path';

let stageWindow: BrowserWindow | null = null;

export function createStageWindow(): BrowserWindow {
  if (stageWindow) {
    stageWindow.show();
    stageWindow.focus();
    return stageWindow;
  }

  const displays = screen.getAllDisplays();
  // Try to open on a second display, or fallback to main with offset
  const secondDisplay = displays.find(d => d.bounds.x !== 0 || d.bounds.y !== 0);

  stageWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    x: secondDisplay ? secondDisplay.bounds.x + 100 : 200,
    y: secondDisplay ? secondDisplay.bounds.y + 100 : 100,
    minWidth: 800,
    minHeight: 480,
    autoHideMenuBar: true,
    backgroundColor: '#111827',
    title: 'Stage Display — BethPresenter',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    stageWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}stage.html`);
  } else {
    stageWindow.loadFile(path.join(__dirname, '../dist/stage.html'));
  }

  stageWindow.on('closed', () => {
    stageWindow = null;
  });

  return stageWindow;
}

export function getStageWindow(): BrowserWindow | null {
  return stageWindow;
}

export function closeStageWindow() {
  if (stageWindow) {
    stageWindow.close();
    stageWindow = null;
  }
}
