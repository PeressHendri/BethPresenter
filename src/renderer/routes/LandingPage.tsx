import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Zap, Heart, Shield, Monitor as MonitorIcon, Smartphone, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 bg-[#09090b] text-[#fafafa] overflow-y-auto no-scrollbar selection:bg-blue-500/30 w-full h-full relative">
      {/* ── HERO SECTION ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-[var(--accent-blue)]/10 blur-[130px] rounded-full opacity-40 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full opacity-30" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest mb-10 animate-fade-in shadow-2xl shadow-blue-500/10">
            <Zap size={14} className="fill-blue-400" />
            Worship Presentation Software
          </div>
          
          <h1 className="text-6xl md:text-[9rem] font-black tracking-tighter leading-[0.85] mb-10 text-white selection:bg-blue-500">
            Presentasi Ibadah<br />
            <span className="bg-gradient-to-r from-blue-400 via-teal-400 to-purple-400 bg-clip-text text-transparent italic">
              Elegan & Professional
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-[#a1a1aa] max-w-3xl mx-auto mb-14 leading-relaxed font-medium">
            Tampilkan lirik lagu, ayat Alkitab, dan media ke proyektor dengan satu klik.
            Kendalikan dari HP. <span className="text-white border-b-2 border-blue-500/50">Gratis selamanya untuk gereja.</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Button 
              size="xl" 
              variant="accent" 
              onClick={() => navigate('/')}
              className="group shadow-2xl shadow-blue-500/20"
            >
              Luncurkan Aplikasi <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="xl" variant="glass">
              Pelajari Lebih Lanjut
            </Button>
          </div>
        </div>

        {/* Floating Mockup Preview */}
        <div className="mt-28 relative px-6 w-full max-w-5xl group cursor-pointer" onClick={() => navigate('/')}>
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-teal-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative rounded-2xl border border-white/10 bg-[#18181b] shadow-2xl overflow-hidden aspect-video transition-all duration-500 group-hover:scale-[1.01] group-hover:shadow-blue-500/10">
             <div className="h-10 bg-[#111113] border-b border-white/5 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50 hover:bg-red-500 transition-colors" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50 hover:bg-yellow-500 transition-colors" />
                <div className="w-3 h-3 rounded-full bg-green-500/50 hover:bg-green-500 transition-colors" />
             </div>
             <div className="flex-1 h-full bg-gradient-to-br from-[#0d1117] via-[#0f172a] to-[#0d1117] flex items-center justify-center p-16 text-center">
                <div className="animate-float">
                   <p className="text-4xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-2xl">
                     "Ajaib KAU Tuhan<br/>Agung dan Perkasa"
                   </p>
                   <p className="text-sm font-black uppercase tracking-[0.4em] text-blue-400/60 flex items-center justify-center gap-3">
                     <span className="w-12 h-px bg-blue-500/20" />
                     AJAIB KAU TUHAN • VERSE 1
                     <span className="w-12 h-px bg-blue-500/20" />
                   </p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section className="max-w-7xl mx-auto px-6 py-40 grid md:grid-cols-3 gap-10">
        <FeatureCard 
          icon={<Zap className="text-yellow-400 fill-yellow-400/20" size={32} />}
          title="Instant Sync"
          desc="Latency 0ms antara operator dan projector. Transisi slide yang ultra-smooth seperti broadcast profesional."
        />
        <FeatureCard 
          icon={<Smartphone className="text-blue-400 fill-blue-400/20" size={32} />}
          title="HP Remote"
          desc="Gunakan smartphone apa saja sebagai remote control. Cari Alkitab dan ganti slide dari area jemaat."
        />
        <FeatureCard 
          icon={<Heart className="text-pink-400 fill-pink-400/20" size={32} />}
          title="Gratis & Open"
          desc="BethPresenter hadir untuk mendukung pelayanan gereja tanpa batasan lisensi yang mahal."
        />
      </section>

      {/* ── CTA BOTTOM ── */}
      <section className="py-32 border-t border-white/5 bg-gradient-to-b from-transparent to-blue-600/5 text-center px-6">
        <h2 className="text-4xl md:text-7xl font-black mb-12 tracking-tighter">Ibadah Lebih Hidup Mulai Hari Ini</h2>
        <Button 
          variant="accent" 
          size="xl" 
          onClick={() => navigate('/')} 
          className="px-16 shadow-2xl"
        >
          Luncurkan BethPresenter Gratis
        </Button>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-10 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-blue-500/20 hover:bg-white/[0.05] transition-all duration-300 group">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-4 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{title}</h3>
      <p className="text-[#a1a1aa] leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
