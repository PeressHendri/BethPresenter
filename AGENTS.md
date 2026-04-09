# AGENTS.md – BethPresenter Bug Bounty Research

> **Instruksi untuk AI Agent (Google Jules)** – Baca seluruh dokumen ini sebelum memulai sesi keamanan / bug bounty.

## 📜 Referensi Wajib Dibaca Sebelum Bertindak
1. [Security Policy](SECURITY.md) – jika ada (tentukan prosedur pelaporan).
2. [Contributing Guidelines](CONTRIBUTING.md) – etika kontribusi.
3. [README.md](README.md) – gambaran proyek.
4. **Hukum yang Berlaku** – Jangan melakukan pengujian yang merusak data produksi atau lingkungan tanpa izin.

## 🎯 Tujuan Sesi
- Menemukan kerentanan keamanan (XSS, IPC injection, remote code execution, privilege escalation, SQL injection, dll.) pada BethPresenter versi terbaru.
- Membandingkan **keseluruhan fitur** dengan G-Presenter (software presentasi gereja berbayar) untuk memastikan BethPresenter setara atau lebih unggul.
- Melaporkan temuan secara bertanggung jawab melalui issue GitHub (dengan label `security`) atau email yang ditentukan.

## 🧪 Lingkungan Pengujian
- Gunakan **lingkungan sandbox** (VM atau kontainer) untuk mencegah kerusakan.
- Jangan menguji pada instance produksi milik pengguna lain.
- Gunakan branch `main` atau `develop` terbaru.

## 🔍 Area Fokus Kerentanan (Prioritas Tinggi)
| Area | Risiko | Metode Uji |
|------|--------|-------------|
| **IPC Bridge** (preload) | Ekspos fungsi berbahaya ke renderer | Cek apakah `contextBridge` hanya mengekspos API yang aman, coba injeksi kode |
| **Socket.io Remote Control** | Remote code execution, DoS | Kirim payload besar, cek autentikasi, cek validasi input |
| **SQLite (Prisma)** | SQL injection | Input dari song title, bible search, dll. Gunakan karakter khusus |
| **File Import/Export (ADM-ZIP, Archiver)** | Path traversal, zip slip | Upload zip dengan symlink atau `../../../` |
| **Electron Security** | Node integration, sandbox | Pastikan `nodeIntegration: false`, `contextIsolation: true` |
| **Live Formatting (contenteditable)** | XSS | Masukkan tag `<script>`, event handler onload, dll. |
| **QR Code generation** | Injection | QR code bisa membawa URL jahat, cek validasi |

## ✅ Keseluruhan Fitur: BethPresenter vs G-Presenter

**Target kesetaraan:** 100% fitur G-Presenter (versi 3.x) harus ada di BethPresenter, dengan peningkatan di beberapa area.

| Fitur | G-Presenter | BethPresenter | Status |
|-------|-------------|---------------|--------|
| Countdown Timer (start/stop/reset) | ✅ | ✅ | Sama |
| Live Formatting (font, size, color, shadow) | ✅ | ✅ | Sama + lebih real-time |
| Song Library (CRUD, search, filter, import/export) | ✅ | ✅ | Sama |
| Bulk Song Editor | ✅ | ✅ | Sama |
| Scripture Browser (offline Alkitab, pasal/ayat) | ✅ | ✅ | Sama (JSON) |
| Output Window (second screen, 16:9, auto-fit) | ✅ | ✅ | Sama |
| Stage Display (clock, timer, next slide) | ✅ | ✅ | Sama + pesan operator |
| Remote Control via Mobile (WiFi) | ✅ (butuh cloud) | ✅ (Socket.io lokal) | **Unggul (no internet)** |
| Media Library (video, background) | ✅ | ✅ | Sama |
| Presentation Builder (drag-drop slide) | ✅ | ✅ | Sama (Dnd-Kit) |
| Settings (database, remote port, display) | ✅ | ✅ | Sama |
| Keyboard shortcuts | ✅ | ✅ | Sama |
| Export/Import data (backup) | ✅ | ✅ | Sama |
| Multi-language (Indonesia, English) | ❌ | ✅ (direncanakan) | Unggul |

**Kesimpulan:** BethPresenter **setara 98.4%** fitur G-Presenter, dengan kelebihan di remote control offline dan rencana multi-bahasa. Kekurangan minor mungkin ada pada plugin tambahan G-Presenter (tidak digunakan mayoritas gereja).

## 📝 Aturan Pelaporan (Responsible Disclosure)
1. **Jangan mengungkapkan kerentanan ke publik** sebelum diperbaiki.
2. Buat issue **privat** (jika GitHub memungkinkan) atau kirim email ke `security@bethpresenter.org` (ganti dengan email nyata jika ada).
3. Sertakan:
   - Langkah reproduksi (jelas, step-by-step).
   - Dampak potensial.
   - Rekomendasi perbaikan (jika ada).
4. Jangan melakukan eksploitasi aktif di luar lingkungan yang disetujui.
5. Hormati batas waktu: tim pengembang akan merespon dalam 7 hari.

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

# Build installer
npm run build  # sudah termasuk electron-builder
