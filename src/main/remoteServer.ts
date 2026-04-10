import { createServer } from 'http';
import { BrowserWindow } from 'electron';
import path from 'path';
import os from 'os';
import fs from 'fs';

// Dynamically require express & socket.io so app doesn't crash if npm install not yet run
let express: any;
let ioLib: any;
let qrcode: any;

try { express = require('express'); } catch { /* not installed */ }
try { ioLib = require('socket.io'); } catch { /* not installed */ }
try { qrcode = require('qrcode'); } catch { /* not installed */ }

export interface RemoteSlide {
  id: string;
  label: string;
  text: string;
  songTitle?: string;
}

export interface RemoteState {
  currentIndex: number;
  slides: RemoteSlide[];
  isBlank: boolean;
  isHidden: boolean;
  serviceItems?: any[];
  activeStepIndex?: number;
}

let httpServer: ReturnType<typeof createServer> | null = null;
let io: any = null;
let remoteState: RemoteState = { currentIndex: 0, slides: [], isBlank: false, isHidden: false };
let currentPin = '';

// Callback set by main process
let onSlideChangeCallback: ((data: any) => void) | null = null;
let onBlankToggleCallback: ((blank: boolean) => void) | null = null;
let onHideToggleCallback: ((hidden: boolean) => void) | null = null;
let onSendBibleCallback: ((data: any) => void) | null = null;
let onClientChangeCallback: ((count: number) => void) | null = null;

export function getLocalIP(): string {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    const iface = ifaces[name];
    if (!iface) continue;
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return '127.0.0.1';
}

export async function generateQRCode(url: string): Promise<string> {
  if (!qrcode) return '';
  try {
    return await qrcode.toDataURL(url, { width: 256, margin: 2, color: { dark: '#000000', light: '#ffffff' } });
  } catch { return ''; }
}

function getRemoteHtmlPath(): string {
  const candidates = [
    path.resolve(process.cwd(), 'public/remote/index.html'),
    path.resolve(__dirname, '../../public/remote/index.html'),
    path.resolve(process.cwd(), 'remote/index.html'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return '';
}

export function startRemoteServer(
  port: number,
  callbacks: {
    onSlideChange?: (data: any) => void;
    onBlankToggle?: (blank: boolean) => void;
    onHideToggle?: (hidden: boolean) => void;
    onSendBible?: (data: any) => void;
    onClientChange?: (count: number) => void;
  }
): Promise<{ port: number; ip: string; qrDataUrl: string; pin: string }> {
  return new Promise(async (resolve, reject) => {
    if (!express || !ioLib) {
      reject(new Error('express or socket.io not installed. Run: npm install express socket.io qrcode'));
      return;
    }

    if (httpServer) {
        const ip = getLocalIP();
        const url = `http://${ip}:${port}/remote`;
        const qrDataUrl = await generateQRCode(url);
        resolve({ port, ip, qrDataUrl, pin: currentPin });
        return;
    }

    onSlideChangeCallback = callbacks.onSlideChange ?? null;
    onBlankToggleCallback = callbacks.onBlankToggle ?? null;
    onHideToggleCallback = callbacks.onHideToggle ?? null;
    onSendBibleCallback = callbacks.onSendBible ?? null;
    onClientChangeCallback = callbacks.onClientChange ?? null;

    const app = express();
    httpServer = createServer(app);
    io = new ioLib.Server(httpServer, {
      cors: { origin: '*', methods: ['GET', 'POST'] }
    });

    currentPin = Math.floor(100000 + Math.random() * 900000).toString();

    const remotePath = getRemoteHtmlPath();
    if (remotePath) {
      app.use('/remote', express.static(path.dirname(remotePath), { index: 'index.html' }));
      app.get('/', (_req: any, res: any) => res.redirect('/remote'));
    }

    io.on('connection', (socket: any) => {
      onClientChangeCallback?.(io.engine.clientsCount);
      
      socket.on('join-remote', (pin: string) => {
        if (pin === currentPin) {
          socket.join('presenter-room');
          socket.emit('auth-success', { status: 'authorized', pin: currentPin });
          socket.emit('state-update', remoteState);
        } else {
          socket.emit('auth-failure', { message: 'Invalid PIN' });
        }
      });

      socket.on('control-action', (data: { action: string; payload?: any }) => {
        if (!socket.rooms.has('presenter-room')) return;
        
        switch (data.action) {
          case 'NEXT_SLIDE': onSlideChangeCallback?.('next'); break;
          case 'PREV_SLIDE': onSlideChangeCallback?.('prev'); break;
          case 'JUMP_TO': onSlideChangeCallback?.(data.payload); break;
          case 'TOGGLE_BLANK': {
             remoteState.isBlank = !remoteState.isBlank;
             onBlankToggleCallback?.(remoteState.isBlank);
             io.to('presenter-room').emit('state-update', remoteState);
             break;
          }
          case 'BIBLE_SEARCH': {
             // Relay to renderer to fetch results
             BrowserWindow.getAllWindows().forEach(win => {
               win.webContents.send('remote:search-bible', { query: data.payload, socketId: socket.id });
             });
             break;
          }
          case 'SEND_BIBLE': onSendBibleCallback?.(data.payload); break;
        }
      });

      socket.on('disconnect', () => {
        onClientChangeCallback?.(io.engine.clientsCount);
      });
    });

    httpServer.listen(port, '0.0.0.0', async () => {
      const ip = getLocalIP();
      const url = `http://${ip}:${port}/remote`;
      const qrDataUrl = await generateQRCode(url);
      console.log(`Remote Server started at ${url} with PIN ${currentPin}`);
      resolve({ port, ip, qrDataUrl, pin: currentPin });
    });
  });
}

export function stopRemoteServer(): Promise<void> {
  return new Promise(resolve => {
    if (!httpServer) { resolve(); return; }
    const srv = httpServer;
    httpServer = null;
    io = null;
    srv.close(() => resolve());
  });
}

export function sendToClient(socketId: string, event: string, data: any) {
  if (io) {
    const s = io.sockets.sockets.get(socketId);
    if (s) s.emit(event, data);
  }
}

export function broadcastState(state: Partial<RemoteState>) {
  remoteState = { ...remoteState, ...state };
  if (io) io.to('presenter-room').emit('state-update', remoteState);
}
