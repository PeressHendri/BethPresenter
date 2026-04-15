# 🚀 **CARA MENJALANKAN BETHPRESENTER**

## ⚠️ **PENTING: Frontend Harus Running Dulu!**

Error `500 Internal Server Error` terjadi karena Electron mencoba load dari `http://localhost:3000` tapi Vite dev server belum jalan.

---

## 📋 **CARA 1: Manual (2 Terminal)**

### **Terminal 1 - Start Frontend (Vite):**
```bash
cd /Users/mac/Documents/Project/BethPresenterNew/frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.4.10  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### **Terminal 2 - Start Electron:**
```bash
cd /Users/mac/Documents/Project/BethPresenterNew/electron
npm start
```

**Expected Output:**
```
Database initialized successfully
🌐 LAN Server running on port 3131
```

---

## 📋 **CARA 2: Otomatis (1 Command)**

```bash
cd /Users/mac/Documents/Project/BethPresenterNew/electron
npm run dev:all
```

Ini akan:
1. Start frontend di background
2. Tunggu 3 detik
3. Start Electron

---

## 📋 **CARA 3: Production Build**

Jika ingin test tanpa dev server:

```bash
# 1. Build frontend
cd /Users/mac/Documents/Project/BethPresenterNew/frontend
npm run build

# 2. Start Electron (akan load dari file dist)
cd ../electron
npm start
```

---

## 🔧 **TROUBLESHOOTING**

### **Error: 500 Internal Server Error**

**Penyebab:** Frontend belum running

**Solusi:**
```bash
# Terminal 1
cd frontend
npm run dev

# Terminal 2 (setelah frontend ready)
cd electron
npm start
```

---

### **Error: Port 3000 Already in Use**

**Penyebab:** Ada process lain menggunakan port 3000

**Solusi:**
```bash
# Kill process di port 3000
lsof -ti:3000 | xargs kill -9

# Start frontend lagi
cd frontend
npm run dev
```

---

### **Error: Port 3131 Already in Use**

**Penyebab:** Electron instance sebelumnya masih jalan

**Solusi:**
```bash
# Kill process di port 3131
lsof -ti:3131 | xargs kill -9

# Start Electron lagi
cd electron
npm start
```

---

### **Security Warnings**

Jika masih ada security warnings:

1. ✅ **webSecurity disabled** - SUDAH DIPERBAIKI ( sekarang `true`)
2. ✅ **allowRunningInsecureContent** - SUDAH DIPERBAIKI (sekarang `false`)
3. ⚠️ **Content-Security-Policy** - Warning ini normal di development mode

**Content-Security-Policy warning akan hilang saat production build.**

---

## 🎯 **DEVELOPMENT WORKFLOW**

### **Daily Development:**

```bash
# 1. Start frontend (biarkan running)
cd frontend
npm run dev

# 2. Start Electron di terminal terpisah
cd electron
npm start

# 3. Edit code
# Frontend akan auto-reload (HMR)
# Electron perlu restart untuk main.js changes
```

### **After Installing New Packages:**

```bash
# If installing in frontend
cd frontend
npm install <package>
# Frontend auto-reload

# If installing in electron
cd electron
npm install <package>
npm run rebuild  # For native modules
```

### **After Changing main.js or preload.js:**

```bash
# Restart Electron
# Ctrl+C di terminal Electron
npm start
```

---

## 📊 **ARCHITECTURE OVERVIEW**

```
┌─────────────────────────────────────────┐
│           Frontend (Vite)               │
│  http://localhost:3000                  │
│  - React Components                     │
│  - State Management                     │
│  - UI/UX                                │
└─────────────┬───────────────────────────┘
              │
              │ IPC (contextBridge)
              │
┌─────────────▼───────────────────────────┐
│         Electron Main Process           │
│  - Window Management                    │
│  - Database (SQLite)                    │
│  - LAN Server (3131)                    │
│  - File System                          │
└─────────────────────────────────────────┘
```

---

## 🧪 **VERIFY EVERYTHING WORKS**

### **1. Check Frontend:**
```bash
curl http://localhost:3000
```
Should return HTML

### **2. Check LAN Server:**
```bash
curl http://localhost:3131/api/local-remote/bibles/kjv
```
Should return JSON or 404 (if Bible not installed)

### **3. Check Electron:**
- App window should open
- No console errors (except CSP warning in dev)
- Database initialized message in terminal

---

## 📝 **QUICK REFERENCE**

| Task | Command |
|------|---------|
| **Start Dev (Manual)** | Terminal 1: `cd frontend && npm run dev`<br>Terminal 2: `cd electron && npm start` |
| **Start Dev (Auto)** | `cd electron && npm run dev:all` |
| **Build Production** | `cd frontend && npm run build` then `cd electron && npm start` |
| **Rebuild Native** | `cd electron && npm run rebuild` |
| **Kill Port 3000** | `lsof -ti:3000 \| xargs kill -9` |
| **Kill Port 3131** | `lsof -ti:3131 \| xargs kill -9` |

---

## ✅ **CHECKLIST BEFORE REPORTING ISSUES**

- [ ] Frontend running on port 3000?
- [ ] Electron app opened?
- [ ] No 500 errors in console?
- [ ] Database initialized successfully?
- [ ] LAN server running on port 3131?
- [ ] Using Node.js v20? (`node --version`)

---

## 🆘 **STILL HAVE ISSUES?**

Send this info:

1. **Node version:**
   ```bash
   node --version
   ```

2. **Frontend status:**
   ```bash
   curl -I http://localhost:3000
   ```

3. **Electron console logs** (from terminal)

4. **Browser console logs** (F12 in Electron app)

---

**Last Updated:** April 15, 2026  
**Status:** ✅ Tested & Working
