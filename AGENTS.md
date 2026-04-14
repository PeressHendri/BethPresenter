REFERENSI AGENTS.md: Gunakan panduan di AGENTS.md sebagai baseline.

## 🎯 MISI UTAMA
Buat BethPresenter menjadi aplikasi presentasi ibadah yang setara dengan **G-Presenter, EasyWorship, dan ProPresenter** dengan fitur LENGKAP dan performa OPTIMAL.

## ✅ KRITERIA KEBERHASILAN (Definition of Done)

### 1. Halaman Presentasi (Dashboard Studio)
- [ ] Layout 3 kolom: Susunan Ibadah (kiri) | Pratinjau (tengah) | Alur Ibadah + Next Slide (kanan)
- [ ] Drag & drop reorder item di Susunan Ibadah
- [ ] Klik item → tampilkan slide grid di pratinjau
- [ ] Klik slide → langsung tampil di output (LIVE) atau preview (LATIHAN)
- [ ] Mode LATIHAN (ungu) dan LIVE (merah) dengan indikator jelas
- [ ] Keyboard navigasi: ← → (ganti slide), B (blank screen)
- [ ] Tombol "Buka Output" membuka jendela proyektor terpisah

### 2. Perpustakaan Lagu (Song Library)
- [ ] CRUD lagu (Tambah, Edit, Hapus)
- [ ] Search berdasarkan judul, penulis, lirik, tag
- [ ] Tag system (Worship, Praise, Fast, dll)
- [ ] Editor lagu WYSIWYG dengan:
  - [ ] Preview background CHECKERED (kotak-kotak) untuk transparansi
  - [ ] Paste Lyrics dengan deteksi blank line → multi slide
  - [ ] Auto-detect [Verse], [Chorus], [Bridge] → set label otomatis
  - [ ] Format Panel: Font, Ukuran, Spacing, Line Height, Warna, Shadow, Alignment
  - [ ] Background teks TRANSPARAN (bisa melihat background di belakang)
  - [ ] Custom Slide Order (drag & drop reorder slide)
  - [ ] Split slide (Alt+Enter)
  - [ ] Metadata: Penulis, CCLI, Tags

### 3. Alkitab (Bible)
- [ ] Minimal 3 terjemahan bawaan (KJV, ASV, Tagalog/Indonesia)
- [ ] Browsing kitab → pasal → ayat
- [ ] Pilih ayat (single/range/multi) → kirim ke output
- [ ] Search ayat berdasarkan referensi atau konten
- [ ] Support tampilan side-by-side (2 terjemahan)
- [ ] Import terjemahan baru via Zefania XML (Pro feature)

### 4. Media Library
- [ ] Upload gambar (JPG, PNG, GIF, WebP)
- [ ] Upload video (MP4, WebM, MOV)
- [ ] Upload PPT/PPTX (konversi ke gambar atau embed)
- [ ] Grid preview dengan thumbnail
- [ ] Filter: Semua / Gambar / Video / PPT
- [ ] Klik media → preview modal → "Tambah ke Jadwal"
- [ ] Video controls: play, pause, loop, mute (saat live)

### 5. Countdown Timer
- [ ] Mode: Durasi (1-30 menit) atau Target Waktu (misal 09:00)
- [ ] Judul dan teks tambahan (contoh: "Ibadah akan segera dimulai")
- [ ] Background: warna, gambar, atau video
- [ ] Tampilkan timer di Output dan Stage Display
- [ ] Tombol: Start, Pause, Reset

### 6. Tampilan Panggung (Stage Display)
- [ ] Panel kiri: Lirik slide saat ini (besar)
- [ ] Panel kanan atas: Pratinjau slide berikutnya
- [ ] Panel kanan bawah: Countdown + pesan dari operator
- [ ] Pesan cepat: "Lagu Berikutnya", "Waktu Doa", "Persembahan", "Istirahat"

### 7. Output Display (Proyektor)
- [ ] Terpisah dari window operator (bisa di pindahkan ke monitor 2)
- [ ] Menampilkan konten SAMA PERSIS dengan preview operator
- [ ] Support teks (lirik/alkitab) dengan style lengkap
- [ ] Support gambar (full screen, fit atau fill)
- [ ] Support video (auto-play saat live, loop optional)
- [ ] Support PPT (iframe embed)
- [ ] Background transparan (teks di atas gambar/video)

### 8. Remote Control (Mobile/Tablet)
- [ ] Buka browser → scan QR code atau masukkan PIN
- [ ] Tidak perlu install app
- [ ] Kontrol: next, prev, blank, toggle lyrics
- [ ] Tap slide langsung lompat ke slide tersebut
- [ ] Search Bible dari remote

### 9. Multi-Display Sync (Pro Feature)
- [ ] 3+ layar tambahan via Wi-Fi
- [ ] Sinkronisasi slide real-time (latency < 100ms)
- [ ] Setiap client cukup buka browser dengan PIN

### 10. Performa & Optimasi
- [ ] Database: SQLite dengan WAL mode, indexing, query < 10ms
- [ ] Socket.io: batching 50ms, throttle navigasi
- [ ] Frontend: React.memo, useCallback, useMemo, lazy loading
- [ ] Memory: cleanup setiap 5 menit, history terbatas
- [ ] Startup: < 2 detik dengan skeleton loader
- [ ] Bundle size: < 2MB (gzipped)

## 📁 FILE YANG HARUS DIPERIKSA/DIPERBAIKI

### Frontend (React + Vite)
```

/frontend/src/
├── pages/
│   ├── PresentationPage.jsx     → Halaman utama (layout 3 kolom + routing tab)
│   ├── DisplayClientPage.jsx    → Halaman output proyektor
│   ├── RemotePage.jsx           → Halaman remote control
│   └── StageDisplayPage.jsx     → Halaman tampilan panggung
├── components/
│   ├── SlideRenderer.jsx        → Universal renderer (teks, gambar, video, ppt)
│   ├── PreviewPanel.jsx         → Panel pratinjau tengah
│   ├── SchedulePanel.jsx        → Panel kiri (Susunan Ibadah)
│   ├── FlowPanel.jsx            → Panel kanan (Next Slide + Alur Ibadah)
│   ├── SongLibrary.jsx          → Perpustakaan Lagu
│   ├── SongEditorModal.jsx      → Editor lagu (paste lyrics, format, custom order)
│   ├── BibleView.jsx            → Browser Alkitab
│   ├── MediaView.jsx            → Media Library (upload gambar/video/ppt)
│   ├── CountdownView.jsx        → Countdown Timer
│   ├── StageView.jsx            → Kirim pesan ke panggung
│   ├── MainHeader.jsx           → Header (project, save, output, settings)
│   └── SettingsModal.jsx        → Pengaturan
├── context/
│   └── ProjectContext.jsx       → Global state (schedule, liveState, socket, dll)
├── hooks/
│   ├── useThrottle.js           → Throttle navigasi slide
│   └── useDebounce.js           → Debounce search
└── utils/
    ├── memoryCleanup.js         → Cleanup memory setiap 5 menit
    └── imageOptimize.js         → Kompresi gambar sebelum upload

```

### Backend (Node.js + Express + Socket.io)
```

/backend/
├── index.js                     → Main server (Express, Socket.io, API routes)
├── db/
│   └── optimize.js              → SQLite WAL mode, indexing, batch insert
└── socket/
    └── broadcaster.js           → Socket.io batching & throttling

```

### Database (SQLite)
```

beth_presenter.db
├── songs (id, title, author, ccli, tags, slides)
├── presentations (id, name, items)
├── media (id, name, type, path, thumbnail)
├── bible_verses (id, version, book, chapter, verse, content)
└── display_sessions (id, pin, created_at, active_clients)

```

## 🚀 PRIORITAS PENGERJAAN (Urut dari paling krusial)

### PRIORITAS 1: FIX VIDEO TIDAK TAMPIL
- [ ] PreviewPanel.jsx → render video dengan tag <video>
- [ ] DisplayClientPage.jsx → render video di output
- [ ] FlowPanel.jsx → preview video untuk next slide
- [ ] Pastikan path video benar (static serving dari backend)

### PRIORITAS 2: UNIFIKASI PRATINJAU, NEXT SLIDE, & OUTPUT
- [ ] Buat SlideRenderer.jsx universal
- [ ] PreviewPanel, FlowPanel, DisplayClientPage pakai SlideRenderer yang SAMA
- [ ] Teks TRANSPARAN di atas background

### PRIORITAS 3: EDITOR LAGU (G-Presenter level)
- [ ] Background checkered (kotak-kotak)
- [ ] Paste Lyrics dengan blank line detection
- [ ] Format Panel (Font, Spacing, Line Height, Shadow, Alignment)
- [ ] Custom Slide Order (drag & drop)

### PRIORITAS 4: ALKITAB & MEDIA LIBRARY
- [ ] Browser Alkitab dengan search
- [ ] Media Library upload gambar/video/ppt
- [ ] Tambah media ke schedule

### PRIORITAS 5: REMOTE CONTROL & STAGE DISPLAY
- [ ] QR Code + PIN untuk koneksi
- [ ] Kontrol dari HP (next, prev, blank)
- [ ] Kirim pesan ke stage display

### PRIORITAS 6: PERFORMANCE OPTIMIZATION
- [ ] Database WAL mode aktif
- [ ] Socket.io batching
- [ ] Frontend memo & lazy loading

## 🔧 TESTING CHECKLIST (Wajib diuji setelah setiap perbaikan)

### Test 1: Lagu
- [ ] Buat lagu baru dengan judul "Doa Yabes"
- [ ] Paste lirik dengan blank line → otomatis 4 slide
- [ ] Edit format teks (font 102px, warna putih, shadow)
- [ ] Tambah ke Susunan Ibadah
- [ ] Klik slide → tampil di preview → klik play → tampil di output

### Test 2: Video
- [ ] Upload video MP4 ke Media Library
- [ ] Tambah video ke Susunan Ibadah
- [ ] Klik item video → video tampil di preview
- [ ] Klik play → video tampil di output (auto-play)
- [ ] Video loop saat live

### Test 3: Alkitab
- [ ] Buka tab Alkitab → pilih Kejadian 1:1-5
- [ ] Pilih ayat → klik "Kirim ke Output"
- [ ] Output menampilkan ayat dengan referensi

### Test 4: Countdown
- [ ] Buka tab Countdown → set 5 menit
- [ ] Klik "Tampilkan Live" → timer muncul di output

### Test 5: Remote Control
- [ ] Buka http://localhost:3000/remote?pin=XXXXX di HP
- [ ] Tekan tombol Next → slide berganti di output

### Test 6: Performa
- [ ] Navigasi slide cepat 10x → tidak ada lag
- [ ] Buka DevTools → Performance → FPS 60
- [ ] Memory usage < 200MB setelah 1 jam

## 📝 INSTRUKSI UNTUK AI JULES

1. **Mulai dari PRIORITAS 1** (Fix video tidak tampil)
2. **Jangan lompat-lompat** - selesaikan satu prioritas dulu sebelum lanjut
3. **Setiap selesai satu file**, beri tahu saya dan saya akan test
4. **Jika ada error**, kirimkan error log-nya dan perbaiki
5. **Gunakan kode yang sudah ada** - jangan tulis ulang dari nol, cukup MODIFIKASI
6. **Ikuti gaya kode existing** (Tailwind CSS, warna maroon #800000)
7. **Pastikan semua fitur berjalan LANCAR** seperti G-Presenter

## 🎯 TARGET AKHIR

Setelah semua prioritas selesai, BethPresenter harus:
- ✅ Bisa menampilkan LIRIK, ALKITAB, GAMBAR, VIDEO, PPT
- ✅ Pratinjau, Next Slide, dan Output menampilkan hasil SAMA
- ✅ Teks TRANSPARAN di atas background
- ✅ Performa CEPAT dan STABIL seperti EasyWorship/ProPresenter
- ✅ Bisa dikontrol dari HP via Remote Control
