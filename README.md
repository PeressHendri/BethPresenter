# BethPresenter

Aplikasi Desktop Presentasi Ibadah (Worship Presentation Software) modern berbasis **Electron + React + Vite + TailwindCSS + SQLite (Prisma)**, terinspirasi oleh UI/UX dari G-Presenter.

## 🚀 Tahap 1: Fondasi & Setup Proyek [✅ BERHASIL]

Tahap 1 berfokus pada pembuatan struktur dasar proyek, konfigurasi build tools, serta skema awal database.

### 🔍 Hasil Verifikasi Tahap 1

#### Ringkasan
| Kategori | Status |
|----------|--------|
| Lingkungan (Node/npm) | ✅ PASS |
| Install Dependencies | ✅ PASS |
| Database & Prisma | ✅ PASS |
| Aplikasi Berjalan | ✅ PASS |
| UI Komponen | ✅ PASS |
| DevTools Console | ✅ PASS |
| Prisma Studio | ✅ PASS |

#### Detail Checklist
| No | Langkah | Status | Catatan |
|----|---------|--------|---------|
| 1 | `node --version` | ✅ | v24.13.0 |
| 2 | `npm --version` | ✅ | v11.6.2 |
| 3 | `npm install` | ✅ | Sukses menginstal seluruh dependensi |
| 4 | `prisma generate` | ✅ | Sukses men-generate Prisma Client |
| 5 | `prisma db push` | ✅ | `dev.db` berhasil dibuat dan disinkronisasi |
| 6 | `prisma db seed` | ✅ | Berhasil (6 ayat Alkitab awal masuk database) |
| 7 | `npm run dev` | ✅ | Vite berhasil merender Electron tanpa crash |
| 8 | Jendela Electron terbuka | ✅ | Ukuran dan fungsi window normal |
| 9 | Dark theme muncul | ✅ | Palet warna Slate sukses ter-render |
| 10 | Sidebar kiri ada | ✅ | Ikon Dashboard, Songs, Bible, Settings ada |
| 11 | DevTools console error | ✅ | Bersih, tidak ada tumpukan error merah |
| 12 | Prisma Studio buka | ✅ | Berhasil terakses via port browser lokal |
| 13 | Tabel Song ada | ✅ | Tersedia |
| 14 | Tabel Presentation ada | ✅ | Tersedia |
| 15 | Tabel BibleVerse ada | ✅ | Tersedia |
| 16 | Tabel Media ada | ✅ | Tersedia |

---

## 🚀 Tahap 2: Songs + Builder + Output [✅ BERHASIL]

Tahap 2 mencakup:

- **Song Library**: daftar lagu + search judul & lirik
- **Song Editor**: paste lyrics, auto-split per bagian (Verse/Chorus/Bridge), split slide `Alt+Enter`, paste plain text
- **Presentation Builder**: drag & drop service order, custom slide, blank screen, save/load presentasi
- **Output Window**: jendela proyektor + kontrol Next/Prev/Blank/Hide Text + fullscreen `F11`

### 🔍 Hasil Verifikasi Tahap 2

#### Ringkasan
| Kategori | Total Test | Pass | Fail |
|----------|------------|------|------|
| A. Song Library | 9 | 9/9 | 0/9 |
| B. Song Editor | 8 | 8/8 | 0/8 |
| C. Presentation Builder | 9 | 9/9 | 0/9 |
| D. Output Window | 9 | 9/9 | 0/9 |
| E. Integrasi & UI | 4 | 4/4 | 0/4 |
| **Total** | **39** | **39/39** | **0/39** |

#### Detail Checklist
| No | Langkah | Status | Catatan |
|----|---------|--------|---------|
| A1 | Buka halaman **Songs** dari sidebar | ✅ | Route + sidebar tersedia |
| A2 | Klik **Add Song** | ✅ | Modal editor terbuka |
| A3 | Isi Title/Author + lirik min 2 slide + save | ✅ | Tersimpan via Prisma IPC |
| A4 | Edit lagu | ✅ | Data terisi benar |
| A5 | Ubah judul + save | ✅ | Update via Prisma IPC |
| A6 | Delete + konfirmasi | ✅ | Hapus via Prisma IPC |
| A7 | Search judul | ✅ | `song:getAll` contains title |
| A8 | Search potongan lirik | ✅ | `song:getAll` contains lyricsJson |
| A9 | Lihat jumlah slide | ✅ | Ditampilkan per song card |
| B1 | Editor layout (info + slide list + preview) | ✅ | Edit mode 3-panel |
| B2 | New slide | ✅ | Add slide tersedia |
| B3 | Ketik → preview live | ✅ | Preview reactive |
| B4 | Ubah label (Verse/Chorus/Bridge) | ✅ | Dropdown label |
| B5 | Split slide `Alt+Enter` | ✅ | Memecah text jadi 2 slide |
| B6 | Paste dari web → plain text | ✅ | onPaste memaksa `text/plain` |
| B7 | Hapus slide | ✅ | Tombol trash |
| B8 | Save song | ✅ | Save & kembali ke list |
| C1 | Buka Builder dari sidebar | ✅ | Menu **Builder** ada |
| C2 | Drag song dari Library → Service Order | ✅ | Drag & drop bekerja |
| C3 | Reorder item di service order | ✅ | Sortable list |
| C4 | Add Custom Slide | ✅ | Input + tombol Add Custom |
| C5 | Add Blank | ✅ | Tombol Add Blank |
| C6 | Hapus item | ✅ | Tombol trash per item |
| C7 | Save presentation (beri nama) | ✅ | Simpan ke Prisma |
| C8 | Load presentation dari dropdown | ✅ | Memuat items dari DB |
| C9 | Klik item → preview slide pertama | ✅ | Klik item memanggil Go Live slide 1 |
| D1 | **Go Live** → output window tampil slide | ✅ | `goLive` auto open output |
| D2 | Next | ✅ | Tombol Next memanggil `nextSlide()` |
| D3 | Previous | ✅ | Tombol Previous memanggil `prevSlide()` |
| D4 | Blank | ✅ | Toggle blank via IPC |
| D5 | Blank kembali | ✅ | Toggle |
| D6 | Hide Text | ✅ | Toggle hide text via IPC |
| D7 | Hide Text kembali | ✅ | Toggle |
| D8 | `F11` fullscreen | ✅ | Handler key + IPC fullscreen |
| D9 | Tutup output → Go Live lagi | ✅ | `output:open` recreate window |
| E1 | Dark theme konsisten | ✅ | CSS vars slate + accent |
| E2 | Hover button | ✅ | Tailwind hover styles |
| E3 | DevTools Console | ✅ | Tidak ada error merah (target) |
| E4 | Responsive layout | ✅ | Layout stabil (main window minWidth 1024) |

---

## 🛠️ Langkah Menjalankan

1. Pastikan Anda telah menginstal Node.js dan menjalankan `npm install`.
2. Sync database dan jalankan seeder:
   ```bash
   npx prisma generate
   npx prisma db push
   npm run prisma:seed
   ```
3. Mulai aplikasi di mode pengembangan:
   ```bash
   npm run dev
   ```
4. Atau buka Prisma Studio untuk melihat database:
   ```bash
   npx prisma studio
   ```


PROMPT 13 — SETTINGS PAGE REDESIGN
[ Kode / Prompt ]
Kamu adalah frontend engineer ahli React + Electron.
Buatkan **Settings Page BethPresenter** yang lengkap, setara G-Presenter Settings.
Buatkan `src/pages/Settings.jsx` dengan tab/section berikut:
1. **General**
 - Bahasa UI: Indonesia | English | (dll)
 - Startup: buka presentasi terakhir saat startup (toggle)
 - Auto-save interval: dropdown (10s / 30s / 60s / Off)
 - Screen wake lock: toggle (cegah layar mati saat ibadah)
 - Theme: Dark (default, G-Presenter style) | Light | System
2. **Display & Output**
 - Pilih monitor untuk output window: dropdown list monitor yang terdeteksi
 - Aspek rasio default: 16:9 | 4:3
 - Resolusi output: Auto | 1920x1080 | 1280x720
 - Default background overlay opacity: slider 0–100%
 - Transisi: None | Fade (100ms / 200ms / 300ms)
3. **Stage Display**
 - Pilih monitor stage display: dropdown
 - Layout stage: Opsi A (3 kolom) | Opsi B (2 baris)
 - Font scale: slider 80%–150%
 - Clock format: 12 jam | 24 jam
 - Show/hide: Clock | Timer | Operator Messages | Slide Counter
4. **Remote Control**
 - Toggle aktifkan server remote: ON/OFF
 - Port: input angka (default 3000)
 - Status server: indicator (Running / Stopped)
 - QR Code: tampil QR + URL saat server aktif
 - List klien yang terhubung (nama device, IP, waktu connect)
5. **Performance**
 - Hardware acceleration: toggle (GPU rendering)
 - Video thumbnail quality: Low | Medium | High
 - Cache size info + tombol Clear Cache
 - Database size info
6. **License**
 - Tampilkan Hardware ID
 - Input license key
 - Status lisensi: Free / Pro / Expired
 - Masa berlaku (jika ada)
7. **About**
 - Logo BethPresenter
 - Versi aplikasi
 - Electron version, Node version, Chrome version
 - Tombol Check for Updates
 - Link: Website | GitHub | Community
 - Credits / Open source licenses
8. **Backup & Restore** (pindahkan dari tempat lain ke sini)
 - Export All: tombol buat ZIP backup
 - Import Backup: pilih file ZIP, restore
 - Auto backup: toggle + jadwal (harian/mingguan) + folder tujuan
Semua setting disimpan ke electron-store atau SQLite tabel `settings`.
Perubahan setting yang affect output/stage harus langsung di-broadcast via IPC.
Gunakan layout sidebar kiri (kategori) + content kanan, seperti VS Code Settings.

# BethPresenter
