# AGENTS.md – BethPresenter Bug Bounty & Feature Parity Research

> **Instruksi untuk AI Agent (Google Jules)** – Wajib baca seluruh dokumen ini sebelum memulai sesi riset keamanan atau pengujian kesetaraan fitur dengan G-Presenter dan OBS Studio (jika relevan).

## 🧠 Petunjuk Khusus untuk Google Jules

- **Jangan gunakan `--disable-web-security`** karena akan merusak sandbox Electron.
- **Uji XSS melalui `contenteditable`** – coba paste `<img src=x onerror=alert(1)>` di editor lirik atau judul lagu. Jika alert muncul, laporkan.
- **Uji path traversal** – saat impor file ZIP atau ekspor, gunakan nama file seperti `../../../../etc/passwd` untuk melihat apakah sistem keluar dari direktori yang diizinkan.
- **Uji Socket.io** – gunakan skrip sederhana untuk menyambungkan lebih dari 100 klien simulasi secara bersamaan; amati apakah server lokal BethPresenter masih stabil atau mengalami DoS.
- **Periksa environment variables** – pastikan tidak ada kredensial atau secret (misal database URL) yang terekspos di `process.env` pada production build.
- **Bandingkan langsung dengan G-Presenter** – jika memungkinkan, instal G-Presenter versi trial dan uji side-by-side setiap fitur (workflow, shortcut, performa). Dokumentasikan perbedaan.
- **Gunakan `--inspect` untuk debugging** – jika perlu analisis lebih dalam, jalankan Electron dengan `--inspect` dan gunakan Chrome DevTools untuk memeriksa komunikasi IPC atau state memori.
- **Laporkan juga kelemahan UX** – jika alur penggunaan terasa janggal atau tidak intuitif dibanding G-Presenter, masukkan sebagai laporan kualitas (bukan keamanan), tetap dengan label `ux-gap`.

## 📜 Referensi Wajib Dibaca Sebelum Bertindak
1. [Security Policy](SECURITY.md) – jika ada.
2. [Contributing Guidelines](CONTRIBUTING.md) – etika kontribusi.
3. [README.md](README.md) – gambaran proyek.
4. **Hukum yang Berlaku** – Jangan melakukan pengujian yang merusak data produksi atau lingkungan tanpa izin.

## 🎯 Tujuan Sesi
- Menemukan kerentanan keamanan (XSS, IPC injection, remote code execution, privilege escalation, SQL injection, dll.) pada BethPresenter versi terbaru.
- Membandingkan **keseluruhan fungsi, desain, alur penggunaan, dan performa** dengan G-Presenter (software presentasi ibadah berbayar) dan – jika diminta – dengan OBS Studio (untuk fitur streaming).
- Melaporkan temuan secara bertanggung jawab.

## 🧪 Lingkungan Pengujian
- Gunakan **lingkungan sandbox** (VM atau kontainer).
- Jangan menguji pada instance produksi milik pengguna lain.
- Gunakan branch `main` atau `develop` terbaru.

## 🔍 Area Fokus Kerentanan (Prioritas Tinggi)
| Area | Risiko | Metode Uji |
|------|--------|-------------|
| **IPC Bridge** (preload) | Ekspos fungsi berbahaya | Cek `contextBridge`, coba injeksi kode |
| **Socket.io Remote Control** | RCE, DoS | Payload besar, cek autentikasi |
| **SQLite (Prisma)** | SQL injection | Input `' OR '1'='1` pada pencarian |
| **File Import/Export** | Path traversal, zip slip | Upload zip dengan `../../../` |
| **Electron Security** | Node integration | Pastikan `nodeIntegration: false`, `contextIsolation: true` |
| **Live Formatting (contenteditable)** | XSS | Masukkan `<script>alert(1)</script>` |
| **QR Code generation** | URL jahat | Cek validasi URL |

## ✅ Keseluruhan Fitur: BethPresenter vs G-Presenter (Target 100%)

### Tabel Perbandingan Fitur Utama
| Fitur | G-Presenter | BethPresenter | Status / Catatan |
|-------|-------------|---------------|------------------|
| Countdown Timer (start/stop/reset) | ✅ | ✅ | Sama |
| Live Formatting (font, size, color, shadow) | ✅ | ✅ | Sama + real-time |
| Song Library (CRUD, search, filter, import/export) | ✅ | ✅ | Sama |
| Bulk Song Editor | ✅ | ✅ | Sama |
| Scripture Browser (offline Alkitab) | ✅ | ✅ | JSON, pasal/ayat |
| Output Window (second screen, 16:9, auto-fit) | ✅ | ✅ | Sama |
| Stage Display (clock, timer, next slide) | ✅ | ✅ | Sama + pesan operator |
| Remote Control via Mobile | ✅ (butuh cloud) | ✅ (Socket.io lokal) | **Unggul** |
| Media Library (video, background) | ✅ | ✅ | Sama |
| Presentation Builder (drag-drop slide) | ✅ | ✅ | Dnd-Kit |
| Settings (database, port, display) | ✅ | ✅ | Sama |
| Keyboard shortcuts | ✅ | ✅ | Harus identik (lihat bagian shortcut) |
| Export/Import data (backup) | ✅ | ✅ | Sama |
| Multi-language (Indonesia, English) | ❌ | ✅ (direncanakan) | Unggul |
| Plugin support | Terbatas | ❌ (belum) | Bisa ditambahkan nanti |

### 🔄 Skenario Alur Pengguna (Workflow) – Harus 100% Mirip
| Langkah | Aksi Operator | Ekspektasi Hasil |
|---------|---------------|------------------|
| 1 | Buka aplikasi | Tampilan utama: daftar lagu, kontrol, area preview output. |
| 2 | Impor file lagu (CSV/JSON) | Lagu muncul di library dengan kolom lengkap. |
| 3 | Klik lagu → "Tampilkan ke Output" | Output window menampilkan slide pertama. |
| 4 | Tekan tombol "Next" (atau keyboard →) | Slide berganti, stage display ikut berubah. |
| 5 | Atur timer countdown 5 menit → Start | Timer muncul di stage & output. |
| 6 | Buka remote control via HP (scan QR) | HP bisa kontrol next/prev/timer. |
| 7 | Simpan sesi presentasi | File .json dapat di-load kembali. |
| 8 | Export database lagu ke CSV | CSV dapat dibuka di G-Presenter (struktur kolom sama). |

**Instruksi Jules:** Uji setiap langkah di G-Presenter (jika tersedia) lalu bandingkan dengan BethPresenter. Laporkan perbedaan perilaku.

### ⌨️ Shortcut Keyboard – Wajib Identik
| Fungsi | G-Presenter | BethPresenter (target) | Uji |
|--------|-------------|------------------------|-----|
| Next slide | → atau PageDown | → atau PageDown | ✅ |
| Previous slide | ← atau PageUp | ← atau PageUp | ✅ |
| Start timer | Ctrl+T | Ctrl+T | ✅ |
| Stop timer | Ctrl+Shift+T | Ctrl+Shift+T | ✅ |
| Black screen (output) | B | B | ✅ |
| Tampilkan stage display | S | S | ✅ |
| Clear output | Esc | Esc | ✅ |
| Fullscreen output | F11 | F11 | ✅ |

**Jika shortcut berbeda atau tidak berfungsi, laporkan sebagai gap.**

### 🎨 Desain UI/UX – Aspek yang Harus Setara
- **Navigasi:** Sidebar dengan ikon (lagu, Alkitab, media, pengaturan) – sama seperti G-Presenter.
- **Area kontrol:** Timer, next/prev, slide thumbnail – tata letak serupa.
- **Preview output:** Harus menunjukkan bagaimana teks akan tampil di layar kedua.
- **Stage display:** Harus menunjukkan jam, timer, slide aktif, dan slide berikutnya.
- **Responsivitas:** Ukuran jendela dapat diubah tanpa merusak tata letak.

**Uji visual:** Bandingkan tangkapan layar BethPresenter dengan G-Presenter. Jika ada perbedaan signifikan yang mengganggu produktivitas, laporkan.

### ⚡ Performa & Stabilitas (Benchmark Wajib)
| Metrik | G-Presenter (estimasi) | BethPresenter (target) | Metode Uji |
|--------|------------------------|------------------------|-------------|
| Waktu startup (cold) | <3 detik | <2 detik | Stopwatch dari klik icon hingga UI siap |
| Memori saat idle | ~150 MB | <150 MB | Task Manager / Activity Monitor |
| CPU saat idle | <2% | <2% | `top` / `ps` |
| Ganti slide latency | <100 ms | <100 ms | Rekam video 60fps, hitung frame |
| Remote control latency (LAN) | <50 ms | <50 ms | Ping timestamp |
| Beban 10 remote clients | Stabil | Stabil | Simulasi dengan `socket.io-client` |

**Laporkan jika BethPresenter lebih lambat atau lebih boros memori dari G-Presenter.**

### 🎥 Fitur OBS Studio (Hanya jika diminta)
BethPresenter **bukan** OBS Studio. G-Presenter juga tidak memiliki fitur streaming. Namun jika tim pengembang ingin menambahkan **integrasi dengan OBS** (misal output virtual camera atau websocket control), itu adalah **fitur tambahan di luar kesetaraan**. Jules tidak perlu menguji fitur OBS kecuali diminta secara eksplisit.

> **Keputusan:** Fokus utama BethPresenter adalah presentasi ibadah. Fitur streaming dapat ditambahkan sebagai plugin terpisah, bukan di inti aplikasi.

## 📋 Daftar Periksa Pengujian Manual (Checklist untuk Jules)
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

## 📝 Aturan Pelaporan (Responsible Disclosure)
1. **Jangan mengungkapkan kerentanan ke publik** sebelum diperbaiki.
2. Buat issue **privat** (jika GitHub memungkinkan) atau kirim email ke `security@bethpresenter.org`.
3. Sertakan: langkah reproduksi, dampak potensial, rekomendasi perbaikan.
4. Jangan melakukan eksploitasi aktif di luar lingkungan yang disetujui.
5. Tim pengembang akan merespon dalam 7 hari.

## 🛠️ Perintah Dasar untuk AI Agent (Jules)

```bash
# Clone repositori
git clone https://github.com/PeressHendri/BethPresenter.git
cd BethPresenter

# Install dependensi
npm install

# Generate Prisma client & seed database
npm run prisma:generate
npm run prisma:push
npm run prisma:seed

# Build aplikasi
npm run build

# Jalankan mode development (untuk pengujian manual)
npm run dev

# Jalankan test suite (Jest + Spectron)
npm test

# Build installer (dmg/exe/zip)
npm run build  # sudah termasuk electron-builder
```
