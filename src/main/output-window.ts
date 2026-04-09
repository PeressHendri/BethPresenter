import { BrowserWindow, screen } from 'electron';
import path from 'path';

let outputWindow: BrowserWindow | null = null;

export function createOutputWindow() {
  if (outputWindow) {
    outputWindow.focus();
    return outputWindow;
  }

  const displays = screen.getAllDisplays();
  const externalDisplay = displays.find((display) => {
    return display.bounds.x !== 0 || display.bounds.y !== 0;
  });

  outputWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    x: externalDisplay ? externalDisplay.bounds.x + 50 : 100,
    y: externalDisplay ? externalDisplay.bounds.y + 50 : 100,
    fullscreen: false, // Start non-fullscreen for dev
    autoHideMenuBar: true,
    backgroundColor: '#000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    outputWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}output.html`);
  } else {
    outputWindow.loadFile(path.join(__dirname, '../dist/output.html'));
  }

  outputWindow.on('closed', () => {
    outputWindow = null;
  });

  return outputWindow;
}

export function getOutputWindow() {
  return outputWindow;
}
