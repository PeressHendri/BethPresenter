const { app, BrowserWindow, screen } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

let operatorWindow;
let projectorWindow;

function createWindows() {
  const displays = screen.getAllDisplays();
  const externalDisplay = displays.find((display) => {
    return display.bounds.x !== 0 || display.bounds.y !== 0;
  });

  // 1. Operator Window
  operatorWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "BethPresenter - Operator Dashboard",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const operatorUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../frontend/dist/index.html')}`;
  
  operatorWindow.loadURL(operatorUrl);

  // 2. Projector Window (on second monitor if available)
  projectorWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    x: externalDisplay ? externalDisplay.bounds.x : 0,
    y: externalDisplay ? externalDisplay.bounds.y : 0,
    fullscreen: !!externalDisplay,
    title: "BethPresenter - Output",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const projectorUrl = isDev 
    ? 'http://localhost:3000/projector' 
    : `file://${path.join(__dirname, '../frontend/dist/index.html#/projector')}`;
    
  projectorWindow.loadURL(projectorUrl);

  operatorWindow.on('closed', () => {
    if (projectorWindow) projectorWindow.close();
    app.quit();
  });
}

app.whenReady().then(createWindows);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindows();
});
