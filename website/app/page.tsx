"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, MonitorPlay, Cast, Smartphone, Zap, CheckCircle2, ShieldOff, HeartHandshake, CloudOff, FileText, Music, BookOpen } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background selection:bg-accent/30 flex flex-col relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-5%] w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

      <Navbar />
      <HeroSection />
      <StatsStrip />
      <FeaturesSection />
      <ProductShowcase />
      <HowItWorks />
      <PricingSection />
      <DownloadSection />
      <Footer />
    </main>
  );
}

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-x-0 border-t-0 rounded-none px-6 py-4 flex items-center justify-between transition-all">
       <div className="flex items-center gap-2">
          <MonitorPlay className="text-accent" size={24} />
          <span className="text-xl font-black tracking-tight text-white">BethPresenter</span>
       </div>
       <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-text-muted">
          <a href="#fitur" className="hover:text-white transition">Fitur</a>
          <a href="#cara-kerja" className="hover:text-white transition">Cara Kerja</a>
          <a href="#harga" className="hover:text-white transition">Harga</a>
       </div>
       <button className="bg-accent hover:bg-accent-hover text-white px-5 py-2 rounded-full font-bold text-sm transition shadow-lg shadow-accent/25 flex items-center gap-2">
          <Download size={16} /> Unduh Gratis
       </button>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest mb-8">
          <ShieldOff size={14} /> Tanpa akun · Tanpa langganan · 100% Offline
       </motion.div>
       
       <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight max-w-4xl mb-6">
         Presentasi Ibadah yang <span className="gradient-text">Sederhana & Powerful</span>
       </motion.h1>
       
       <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-text-muted max-w-2xl font-medium mb-10 leading-relaxed">
         Kelola database lagu, tampilkan ayat Alkitab dalam sekejap, kontrol dari HP, dan bagikan lirik ke layar monitor ekstra — dirancang spesifik untuk mendukung Puji & Sembah skala gereja lokal.
       </motion.p>
       
       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button className="bg-white text-background px-8 py-4 rounded-full font-extrabold text-base transition shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
             <Download size={18} /> Unduh Untuk Windows
          </button>
          <button className="glass-panel text-white px-8 py-4 rounded-full font-extrabold text-base transition hover:bg-surface flex items-center justify-center gap-2">
             <MonitorPlay size={18} /> Lihat Demo
          </button>
       </motion.div>

       {/* Hero Mockup */}
       <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }} className="mt-20 w-full rounded-2xl border border-border p-2 bg-surface/30 backdrop-blur-sm relative group cursor-pointer shadow-2xl">
          <div className="absolute inset-x-10 -bottom-10 h-20 bg-accent/30 blur-[100px] pointer-events-none" />
          <div className="rounded-xl overflow-hidden bg-black aspect-video relative">
             <img src="https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&w=1200&q=80" alt="App Interface" className="w-full h-full object-cover opacity-60 mix-blend-screen" />
             <div className="absolute inset-0 flex items-center justify-center">
                 <div className="bg-black/60 backdrop-blur-md p-6 rounded-2xl border border-border flex flex-col items-center">
                    <h3 className="text-white font-bold text-2xl tracking-widest mb-1">Preview Studio</h3>
                    <p className="text-accent text-sm uppercase tracking-[0.3em] font-black">Operator Panel</p>
                 </div>
             </div>
          </div>
       </motion.div>
    </section>
  );
}

function StatsStrip() {
  return (
    <div className="border-y border-border bg-surface/20">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-border">
         <div>
            <h4 className="text-4xl font-black text-white mb-1">31.000+</h4>
            <p className="text-sm font-semibold text-text-muted uppercase tracking-widest">Ayat Tersedia (TB)</p>
         </div>
         <div>
            <h4 className="text-4xl font-black text-white mb-1">Setara Pro</h4>
            <p className="text-sm font-semibold text-text-muted uppercase tracking-widest">Fitur Presentasi OS</p>
         </div>
         <div>
            <h4 className="text-4xl font-black text-white mb-1">100%</h4>
            <p className="text-sm font-semibold text-text-muted uppercase tracking-widest">Offline (Anti Lag)</p>
         </div>
      </div>
    </div>
  );
}

function FeaturesSection() {
  const feats = [
    { icon: <Music />, title: 'Perpustakaan Lagu Super Cepat', desc: 'Pencarian sepersekian detik berkat SQLite WAL. Cari berdasarkan lirik atau judul tanpa delay.' },
    { icon: <BookOpen />, title: 'Alkitab Terintegrasi', desc: 'Browse kitab, pasal, dan ayat seketika tanpa perlu ekstensi.' },
    { icon: <Smartphone />, title: 'Remote dari HP', desc: 'Sistem web-socket memungkinkan pelayan altar berpindah lirik tanpa menekan laptop.' },
    { icon: <Cast />, title: 'Multi-Layar Stage Display', desc: 'Satu output ke Jemaat, satu output rahasia berisikan akor dan pesan ke monitor pemusik.' },
    { icon: <FileText />, title: 'Setlist Real-time Formatting', desc: 'Perbesar ukuran font global hanya dengan tarikan slider. Jemaat dapat melihat perubahan tanpa jeda memuat.' },
    { icon: <CloudOff />, title: 'Tanpa Akun. Mutlak Bebas.', desc: 'Tidak ada sign-in paksa, tidak ada sinkronisasi cloud yang merepotkan. Milik Anda lokal di PC Anda.' }
  ];

  return (
    <section id="fitur" className="py-24 px-6 max-w-7xl mx-auto">
       <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Semua yang dibutuhkan tim ibadah.</h2>
          <p className="text-text-muted text-lg">Dibedah dari pain-points software presentasi lawas.</p>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feats.map((f, i) => (
             <motion.div key={i} whileHover={{ y: -5 }} className="glass-panel p-8 text-left transition hover:border-accent group">
                <div className="w-12 h-12 bg-accent/20 text-accent rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                   {f.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed font-medium">{f.desc}</p>
             </motion.div>
          ))}
       </div>
    </section>
  );
}

function ProductShowcase() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['Operator Panel', 'Song Library', 'Stage Display', 'Mobile Remote'];

  return (
    <section className="py-20 px-6 max-w-5xl mx-auto">
       <div className="flex flex-wrap justify-center gap-2 mb-10">
          {tabs.map((t, idx) => (
             <button key={idx} onClick={() => setActiveTab(idx)} className={`px-6 py-2.5 rounded-full text-sm font-bold transition ${activeTab === idx ? 'bg-white text-background' : 'glass-panel text-text-muted hover:text-white'}`}>
                {t}
             </button>
          ))}
       </div>
       <div className="w-full glass-panel aspect-video rounded-2xl bg-black relative flex items-center justify-center overflow-hidden border border-border">
          {/* Mockup screen renders tab logic. Real App would map specific Next/Image blocks */}
          <div className="absolute inset-0 bg-accent/10 opacity-50 mix-blend-screen" />
          <p className="text-white font-mono opacity-50 tracking-[0.5em] text-lg uppercase flex flex-col items-center gap-2">
             <Zap size={30} className="text-accent" /> Screenshot Modul: {tabs[activeTab]}
          </p>
       </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { num: '01', title: 'Unduh & Install', text: 'Download installer ringan ringan memangkas bloatware, tanpa koneksi extra.' },
    { num: '02', title: 'Import Lagu Anda', text: 'Tarik & Letakkan (Drag-and-Drop) text file atau lirik lama dari EasyWorship.' },
    { num: '03', title: 'Siap Ibadah!', text: 'Susun order pelayanan hanya dalam 5 menit, jadilah pro dalam proyektor.' },
  ];
  return (
    <section id="cara-kerja" className="py-24 px-6 bg-surface/30 border-y border-border">
       <div className="max-w-5xl mx-auto">
         <h2 className="text-3xl md:text-5xl font-black text-white mb-16 text-center">Tiga Langkah Sederhana.</h2>
         <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line on desktop */}
            <div className="hidden md:block absolute top-[28px] left-20 right-20 h-px bg-border-default md:bg-border" />
            
            {steps.map((st, i) => (
               <div key={i} className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center text-xl font-black border-4 border-background mb-6 shadow-xl shadow-accent/20">
                     {st.num}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{st.title}</h3>
                  <p className="text-text-muted text-sm font-medium leading-relaxed">{st.text}</p>
               </div>
            ))}
         </div>
       </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="harga" className="py-24 px-6 max-w-5xl mx-auto">
       <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Jujur dan Transparan.</h2>
          <p className="text-text-muted text-lg">Pilih jalur kelengkapan pelayanan Anda.</p>
       </div>
       <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="glass-panel p-8 md:p-10 flex flex-col">
             <h3 className="text-2xl font-black text-white mb-2">Versi Starter</h3>
             <div className="flex items-baseline gap-1 mb-6">
               <span className="text-4xl font-black text-white">Gratis</span>
               <span className="text-text-muted font-medium">Selamanya</span>
             </div>
             <p className="text-text-muted text-sm mb-8 flex-1">
               Esensial untuk kegiatan cell-group kecil atau persekutuan pemuda tanpa proyektor ekstra.
             </p>
             <ul className="space-y-4 mb-8">
               {['Perpustakaan Lagu (Max 500)', 'Satu Output Proyektor Dasar', 'Alkitab Terintegrasi (Tanpa Search FTS5)', 'Tanpa Remote Control'].map((li, i) => (
                 <li key={i} className="flex gap-3 items-center text-sm font-medium text-text-main">
                    <CheckCircle2 size={18} className="text-text-muted opacity-50" /> {li}
                 </li>
               ))}
             </ul>
             <button className="w-full bg-surface hover:bg-surface-elevated border border-border text-white py-3 rounded-xl font-bold transition">
               Unduh Starter
             </button>
          </div>

          {/* Pro Tier */}
          <div className="bg-gradient-to-b from-accent/20 to-surface border-2 border-accent rounded-xl p-8 md:p-10 flex flex-col relative shadow-2xl shadow-accent/10">
             <div className="absolute top-0 right-8 -translate-y-1/2 bg-accent text-white px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest">Rekomendasi</div>
             
             <h3 className="text-2xl font-black text-white mb-2">Lisensi PRO</h3>
             <div className="flex items-baseline gap-1 mb-6">
               <span className="text-4xl font-black text-white">Rp 250k</span>
               <span className="text-text-muted font-medium">/ 1x Bayar (Lifetime)</span>
             </div>
             <p className="text-text-muted text-sm mb-8 flex-1">
               Tingkatkan gereja lokal Anda ke level broadcast standar stasiun televisi.
             </p>
             <ul className="space-y-4 mb-8">
               {['Unlimited Lagu & Presentasi', 'Output: Jemaat + Stage Display (Musisi)', 'Mobile Remote Web-Socket', 'Full Text Alkitab Search & Custom Backgrounds'].map((li, i) => (
                 <li key={i} className="flex gap-3 items-center text-sm font-medium text-white">
                    <CheckCircle2 size={18} className="text-accent" /> {li}
                 </li>
               ))}
             </ul>
             <button className="w-full bg-accent hover:bg-accent-hover text-white py-3 rounded-xl font-bold transition shadow-lg shadow-accent/30 flex items-center justify-center gap-2">
               <HeartHandshake size={18} /> Beli Lisensi Pro
             </button>
          </div>
       </div>
    </section>
  );
}

function DownloadSection() {
  return (
    <section className="py-32 px-6">
       <div className="max-w-4xl mx-auto bg-accent rounded-3xl p-10 md:p-16 text-center shadow-2xl shadow-accent/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6 relative z-10">
            Tinggalkan Software Lama Anda.
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto font-medium relative z-10">
             Ribuan lagu menanti. Unduh BethPresenter secara gratis untuk Windows 10/11 hari ini dan alami kemurnian interface bebas distorsi.
          </p>
          <button className="bg-white text-accent px-10 py-5 rounded-full font-black text-lg transition hover:scale-105 active:scale-95 shadow-2xl relative z-10 border-[4px] border-white/20">
             Unduh BethPresenter v1.0.0
          </button>
          <p className="text-white/50 text-xs mt-6 font-medium relative z-10">Membutuhkan Windows 10/11 Update Terbaru (64-bit)</p>
       </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-surface/30">
       <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
             <MonitorPlay className="text-text-muted" size={20} />
             <span className="font-bold text-text-muted">BethPresenter</span>
          </div>
          <p className="text-text-muted text-sm font-medium">
             © {new Date().getFullYear()} BethPresenter Team. Diciptakan dengan cinta untuk pelayanan.
          </p>
          <div className="flex items-center gap-6 text-sm font-medium text-text-muted">
             <a href="#" className="hover:text-white transition">Kebijakan Privasi</a>
             <a href="#" className="hover:text-white transition">Kontak</a>
             <a href="#" className="hover:text-white transition">Bantuan Dukungan</a>
          </div>
       </div>
    </footer>
  );
}
