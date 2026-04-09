import { createServer } from 'http';
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
}

let httpServer: ReturnType<typeof createServer> | null = null;
let io: any = null;
let remoteState: RemoteState = { currentIndex: 0, slides: [], isBlank: false, isHidden: false };

// Callback set by main process
let onSlideChange: ((index: number) => void) | null = null;
let onBlankToggle: ((blank: boolean) => void) | null = null;
let onHideToggle: ((hidden: boolean) => void) | null = null;
let onSendBible: ((data: { book: string; chapter: number; verse: number; translation: string }) => void) | null = null;
let onClientChange: ((count: number) => void) | null = null;

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
  // Try multiple paths for dev and prod
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
    onSlideChange?: (index: number) => void;
    onBlankToggle?: (blank: boolean) => void;
    onHideToggle?: (hidden: boolean) => void;
    onSendBible?: (data: any) => void;
    onClientChange?: (count: number) => void;
  }
): Promise<{ port: number; ip: string; qrDataUrl: string }> {
  return new Promise(async (resolve, reject) => {
    if (!express || !ioLib) {
      reject(new Error('express or socket.io not installed. Run: npm install express socket.io qrcode'));
      return;
    }

    if (httpServer) {
      // Already running
      const ip = getLocalIP();
      const url = `http://${ip}:${port}`;
      const qrDataUrl = await generateQRCode(url);
      resolve({ port, ip, qrDataUrl });
      return;
    }

    onSlideChange = callbacks.onSlideChange ?? null;
    onBlankToggle = callbacks.onBlankToggle ?? null;
    onHideToggle = callbacks.onHideToggle ?? null;
    onSendBible = callbacks.onSendBible ?? null;
    onClientChange = callbacks.onClientChange ?? null;

    const app = express();
    httpServer = createServer(app);
    io = new ioLib.Server(httpServer, {
      cors: { origin: '*', methods: ['GET', 'POST'] }
    });

    // Serve static remote UI
    const remotePath = getRemoteHtmlPath();
    if (remotePath) {
      app.use('/remote', express.static(path.dirname(remotePath), { index: 'index.html' }));
      app.get('/', (_req: any, res: any) => res.redirect('/remote'));
    } else {
      // Fallback inline HTML (minimal)
      app.get('/', (_req: any, res: any) => {
        res.send(getInlineFallback());
      });
    }

    // REST endpoint: get current state
    app.get('/api/state', (_req: any, res: any) => {
      res.json(remoteState);
    });

    // Socket.io events
    io.on('connection', (socket: any) => {
      onClientChange?.(io.engine.clientsCount);
      // Send current state to newly connected client
      socket.emit('state-update', remoteState);

      socket.on('next-slide', () => {
        const next = Math.min(remoteState.currentIndex + 1, remoteState.slides.length - 1);
        remoteState.currentIndex = next;
        onSlideChange?.(next);
        io.emit('state-update', remoteState);
      });

      socket.on('prev-slide', () => {
        const prev = Math.max(remoteState.currentIndex - 1, 0);
        remoteState.currentIndex = prev;
        onSlideChange?.(prev);
        io.emit('state-update', remoteState);
      });

      socket.on('jump-to-slide', (index: number) => {
        if (index >= 0 && index < remoteState.slides.length) {
          remoteState.currentIndex = index;
          onSlideChange?.(index);
          io.emit('state-update', remoteState);
        }
      });

      socket.on('toggle-blank', () => {
        remoteState.isBlank = !remoteState.isBlank;
        onBlankToggle?.(remoteState.isBlank);
        io.emit('state-update', remoteState);
      });

      socket.on('toggle-hide', () => {
        remoteState.isHidden = !remoteState.isHidden;
        onHideToggle?.(remoteState.isHidden);
        io.emit('state-update', remoteState);
      });

      socket.on('send-bible', (data: any) => {
        onSendBible?.(data);
        // Don't broadcast – just send to output window
      });

      socket.on('disconnect', () => {
        onClientChange?.(io.engine.clientsCount);
      });
    });

    httpServer.listen(port, '0.0.0.0', async () => {
      const ip = getLocalIP();
      const url = `http://${ip}:${port}`;
      const qrDataUrl = await generateQRCode(url);
      resolve({ port, ip, qrDataUrl });
    });

    httpServer.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        reject(new Error(`Port ${port} already in use.`));
      } else {
        reject(err);
      }
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

/** Push slide state update from main process to all remote clients */
export function broadcastState(state: Partial<RemoteState>) {
  remoteState = { ...remoteState, ...state };
  if (io) io.emit('state-update', remoteState);
}

function getInlineFallback(): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>BethPresenter Remote</title>
<style>body{margin:0;background:#111;color:#fff;font-family:sans-serif;text-align:center;padding:2rem}
h1{font-size:1.5rem;color:#60a5fa}p{color:#999}
</style></head><body>
<h1>BethPresenter Remote</h1>
<p>Remote UI belum tersedia.<br>Pastikan file <code>public/remote/index.html</code> sudah ada.</p>
</body></html>`;
}
