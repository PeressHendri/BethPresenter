#!/bin/bash
# ==========================================================
# BethPresenter - Auto Release & Packaging Script
# Mempersiapkan aset, optimize Prisma, dan bundle AppImage/DMG/NSIS
# ==========================================================

set -e
echo "🚀 Memulai automated release pipeline BethPresenter..."

# 1. Pastikan Dependensi DevOps tersedia (jika belum)
echo "📦 Memeriksa plugin eksklusif builder..."
npm install --save-dev electron-builder electron-log electron-updater better-sqlite3

# 2. SQLite Rebuild - Memastikan better-sqlite3 kompilasi sesuai binary Electron V8
echo "⚙️ Mem-build ulang Native modules untuk target architecture..."
npx electron-rebuild -f -w better-sqlite3

# 3. Prisma Generate
echo "🗄️ Membangkitkan Prisma Client..."
npx prisma generate

# 4. Vite Frontend Build
echo "🏗️ Mengeksekusi kompilasi static Vite React..."
npm run build:react

# 5. TypeScript Main Process build
echo "🏗️ Mengeksekusi kompilasi Electron Main (TSC)..."
npm run build:electron

# 6. Packaging dengan Electron Builder
# Opsional: Jika Anda punya sertifikat untuk Mac (Aple Developer) / Win (CodeSign) 
# eksport WIN_CSC_LINK atau APPLE_ID di environment variables Anda.
echo "📦 Membungkus dalam format Instalasi Desktop (.exe / .dmg / .AppImage)..."
npx electron-builder --mac --win --linux -c electron-builder.json -p always

echo "✅ Rilis selesai dipaketkan! Cek folder /dist atau /release."
exit 0
