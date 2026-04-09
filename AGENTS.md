# AGENTS.md – BethPresenter Feature Parity & Security Audit

> **Instruksi untuk AI Agent (Google Jules)** – Baca seluruh dokumen sebelum memulai sesi pengecekan kesetaraan dengan G-Presenter dan pengujian keamanan.

## 🎯 Tugas Utama Agent
1. **Verifikasi keseluruhan fitur** BethPresenter vs G-Presenter (target 100% setara, beberapa area unggul).
2. **Laporkan setiap ketidaksesuaian** dalam fungsi, alur, shortcut, desain, performa, atau stabilitas.
3. **Cari kerentanan keamanan** sesuai daftar area fokus.
4. **Buat laporan akhir** dengan rekomendasi perbaikan.

## 🧠 Petunjuk Khusus untuk Jules

- **Jangan gunakan `--disable-web-security`** – merusak sandbox Electron.
- **Uji XSS** pada `contenteditable`: paste `<img src=x onerror=alert(1)>` di editor lirik/judul.
- **Uji path traversal** saat impor ZIP: gunakan nama file `../../../../etc/passwd`.
- **Uji Socket.io** dengan >100 klien simulasi (gunakan script `socket.io-client`).
- **Periksa environment variables** di production build – pastikan tidak ada secret terekspos.
- **Bandingkan langsung dengan G-Presenter** – instal versi trial, uji side-by-side.
- **Gunakan `--inspect`** untuk debugging IPC dan memory.
- **Laporkan kelemahan UX** dengan label `ux-gap`.

## 📜 Referensi Wajib
1. [README.md](README.md) – gambaran proyek & fitur.
2. [SECURITY.md](SECURITY.md) – jika ada.
3. [CONTRIBUTING.md](CONTRIBUTING.md) – etika kontribusi.
4. Hukum yang berlaku – jangan uji di lingkungan produksi tanpa izin.

## 🧪 Lingkungan Pengujian
- Gunakan VM atau kontainer (sandbox).
- Branch `main` atau `develop` terbaru.
- Jangan ganggu pengguna lain.

## 🔍 Area Fokus Keamanan (Prioritas Tinggi)

| Area | Risiko | Metode Uji |
|------|--------|-------------|
| IPC Bridge (preload) | Ekspos fungsi berbahaya | Cek `contextBridge`, injeksi kode |
| Socket.io Remote | RCE, DoS | Payload besar, cek autentikasi |
| SQLite (Prisma) | SQL injection | Input `' OR '1'='1` di pencarian |
| File Import/Export | Path traversal, zip slip | Upload zip dengan `../../../` |
| Electron Security | Node integration | Pastikan `nodeIntegration: false`, `contextIsolation: true` |
| Live Formatting | XSS | Masukkan `<script>alert(1)</script>` |
| QR Code | URL jahat | Cek validasi URL |

## ✅ Daftar Periksa Kesesuaian dengan G-Presenter

### A. Fungsi Utama (100% harus sama)

| Fitur | Metode Verifikasi | Target |
|-------|-------------------|--------|
| Countdown Timer | Start/stop/reset, tampil di output & stage | Sama persis |
| Live Formatting | Slider font size, warna, shadow – preview realtime | Sama + realtime |
| Song Library | CRUD, search judul & lirik, filter, import/export CSV | Sama |
| Bulk Song Editor | Edit banyak lagu sekaligus (kategori, kunci, dll) | Sama |
| Scripture Browser | Cari pasal:ayat (Kej 1:1-3), tampil teks | Sama |
| Output Window | Pindah ke monitor kedua, fullscreen F11, auto-fit teks | Sama |
| Stage Display | Tampilkan jam, timer, slide aktif, slide berikutnya | Sama + pesan operator |
| Remote Control | QR code, koneksi socket.io, kontrol dari HP | Unggul (no cloud) |
| Media Library | Putar video, gambar, background loop | Sama |
| Presentation Builder | Drag-drop slide, custom slide, blank, save/load | Sama |
| Settings (8 tab) | General, Display, Stage, Remote, Performance, License, About, Backup | Sama |
| Keyboard Shortcuts | Lihat tabel di bawah | Identik |
| Export/Import Backup | ZIP backup, restore | Sama |

### B. Shortcut Keyboard (harus identik)

| Fungsi | Shortcut G-Presenter | BethPresenter target | Uji |
|--------|----------------------|----------------------|-----|
| Next slide | → atau PageDown | → atau PageDown | ✅ |
| Previous slide | ← atau PageUp | ← atau PageUp | ✅ |
| Start timer | Ctrl+T | Ctrl+T | ✅ |
| Stop timer | Ctrl+Shift+T | Ctrl+Shift+T | ✅ |
| Black screen (output) | B | B | ✅ |
| Toggle stage display | S | S | ✅ |
| Clear output (black) | Esc | Esc | ✅ |
| Fullscreen output | F11 | F11 | ✅ |

### C. Alur Pengguna (Workflow) – uji side-by-side

| Langkah | Aksi | Ekspektasi |
|---------|------|-------------|
| 1 | Buka app | Sidebar kiri (lagu, Alkitab, media, pengaturan) |
| 2 | Impor lagu CSV/JSON | Muncul di library dengan kolom lengkap |
| 3 | Klik lagu → "Tampilkan ke Output" | Output window buka, slide pertama tampil |
| 4 | Tekan Next (→) | Slide berganti, stage ikut berubah |
| 5 | Atur timer 5 menit → Start | Timer muncul di stage & output |
| 6 | Scan QR code dari HP | HP bisa kontrol next/prev/timer |
| 7 | Simpan presentasi (beri nama) | Bisa di-load kembali |
| 8 | Export database lagu ke CSV | CSV bisa dibuka di G-Presenter |

### D. Desain UI/UX

| Aspek | Target kesamaan |
|-------|----------------|
| Navigasi | Sidebar ikon (sama seperti G-Presenter) |
| Area kontrol | Timer, next/prev, slide thumbnail – tata letak serupa |
| Preview output | Menunjukkan tampilan teks di layar kedua |
| Stage display | Jam, timer, slide aktif, slide berikutnya |
| Responsivitas | Ukuran window diubah tanpa merusak layout |

### E. Performa & Stabilitas (benchmark)

| Metrik | Target | Metode Uji |
|--------|--------|-------------|
| Waktu startup (cold) | <2 detik | Stopwatch dari klik icon hingga UI siap |
| Memori idle | <150 MB | Task Manager / Activity Monitor |
| CPU idle | <2% | `top` / `ps` |
| Ganti slide latency | <100 ms | Rekam video 60fps, hitung frame |
| Remote latency (LAN) | <50 ms | Ping timestamp |
| Beban 10 remote clients | Stabil | Simulasi dengan `socket.io-client` |

## 📋 Checklist Pengujian Manual (Jules wajib isi)

- [ ] **Import lagu** dari CSV/JSON (struktur kolom sama dengan G-Presenter)
- [ ] **Export lagu** ke format yang dapat dibaca G-Presenter
- [ ] **Bulk edit** kategori, kunci, penulis (bisa banyak lagu sekaligus)
- [ ] **Scripture browser** – pencarian `Kej 1:1-3` menampilkan teks dengan benar
- [ ] **Output window** – bisa dipindah ke monitor kedua, fullscreen, auto-fit teks
- [ ] **Stage display** – menampilkan timer, jam, slide aktif, slide berikutnya
- [ ] **Remote control** – disconnect/reconnect tanpa restart app
- [ ] **Countdown timer** – bunyi alarm ketika 0, bisa direset
- [ ] **Presentasi multi-slide** – drag-drop mengubah urutan
- [ ] **Keyboard shortcut** – semua fungsi utama bisa diakses tanpa mouse
- [ ] **Dark/light mode** (jika G-Presenter punya) – sesuai
- [ ] **Resize window** – tidak ada elemen yang terpotong atau tumpang tindih
- [ ] **Settings – setiap tab** (General, Display, Stage, Remote, Performance, License, About, Backup) berfungsi
- [ ] **Backup & Restore** – export ZIP, lalu restore, data utuh

## 📝 Aturan Pelaporan

1. **Jangan publikasikan kerentanan** sebelum diperbaiki.
2. Buat issue **privat** atau email ke `security@bethpresenter.org`.
3. Sertakan: langkah reproduksi, dampak, rekomendasi.
4. Jangan eksploitasi aktif di luar lingkungan yang disetujui.
5. Tim akan respon dalam 7 hari.

## 🛠️ Perintah Dasar untuk Jules

```bash
git clone https://github.com/PeressHendri/BethPresenter.git
cd BethPresenter
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run build   # atau npm run dev untuk development
npm test        # jalankan test suite
```

