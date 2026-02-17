
import React from 'react';
import { Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  imageSrc?: string | null;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ imageSrc }) => {
  if (imageSrc) {
    return (
      <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
        <div className="relative w-72 h-96 rounded-2xl overflow-hidden border border-cyan-500/30 bg-black/90 shadow-[0_0_50px_rgba(6,182,212,0.15)]">
          {/* Background Image with processing filter */}
          <img 
            src={imageSrc} 
            alt="Analyzing" 
            className="w-full h-full object-cover opacity-40 filter grayscale contrast-125"
          />
          
          {/* Grid Overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
          
          {/* Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>

          {/* === SCANNING LASER BEAM === */}
          <div className="absolute left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_20px_2px_rgba(34,211,238,0.8)] animate-scan z-20">
             {/* Trail Gradient above the line to create a 'light sheet' effect */}
             <div className="absolute bottom-full left-0 w-full h-16 bg-gradient-to-t from-cyan-400/20 to-transparent"></div>
          </div>

          {/* Corner HUD Markers */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-cyan-500/50 rounded-tl"></div>
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-500/50 rounded-tr"></div>
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-cyan-500/50 rounded-bl"></div>
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-cyan-500/50 rounded-br"></div>

          {/* Top HUD Info */}
          <div className="absolute top-5 left-0 right-0 px-6 flex justify-between text-[10px] font-mono text-cyan-400/80 tracking-widest">
            <span>MÃ_QUÉT: {Math.floor(Math.random() * 9000) + 1000}</span>
            <span className="animate-pulse">TRỰC_TUYẾN</span>
          </div>

          {/* Bottom HUD Progress */}
          <div className="absolute bottom-5 left-6 right-6">
             <div className="flex justify-between text-[10px] font-mono text-cyan-400 tracking-wider mb-1.5">
                <span>ĐANG PHÂN TÍCH NHÂN TRẮC...</span>
                <span className="animate-pulse">ĐANG XỬ LÝ</span>
             </div>
             {/* Decorative Progress Bar */}
             <div className="w-full h-0.5 bg-cyan-900/50">
                <div className="h-full bg-cyan-400 w-[60%] shadow-[0_0_10px_cyan] animate-[pulse_2s_infinite]"></div>
             </div>
             <div className="mt-1 flex justify-between text-[8px] text-cyan-600 font-mono">
                <span>ĐẶC ĐIỂM: ĐÃ XÁC ĐỊNH</span>
                <span>ĐỘ TIN CẬY: 98%</span>
             </div>
          </div>

          {/* Central Target Reticle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-cyan-500/10 rounded-full flex items-center justify-center">
             <div className="w-36 h-36 border border-cyan-500/20 rounded-full animate-[spin_4s_linear_infinite] border-t-transparent border-l-transparent"></div>
             <div className="absolute w-2 h-2 bg-cyan-400 shadow-[0_0_15px_cyan]"></div>
          </div>
          
        </div>
        
        {/* Status Text */}
        <div className="mt-8 space-y-2 text-center z-10">
          <h3 className="text-cyan-400 font-bold tracking-[0.2em] text-sm animate-pulse">HỆ THỐNG ĐANG PHÂN TÍCH</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            AI đang đo đạc tỷ lệ khuôn mặt và đối chiếu với dữ liệu phong thủy năm 2026.
          </p>
        </div>
      </div>
    );
  }

  // Fallback for non-image loading (Horoscope etc)
  return (
    <div className="flex flex-col items-center justify-center py-20 min-h-[400px] animate-fade-in">
      <div className="relative w-24 h-24">
         <div className="absolute inset-0 rounded-full border-4 border-brand-secondary opacity-30"></div>
         <div className="absolute inset-0 rounded-full border-4 border-t-brand-accent border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
         <div className="absolute inset-0 rounded-full border-4 border-b-brand-accent/50 border-t-transparent border-l-transparent border-r-transparent animate-pulse"></div>
         <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-accent w-8 h-8 animate-pulse" />
      </div>
      <p className="mt-8 text-brand-accent font-serif text-xl tracking-wide">Đang thỉnh thiên cơ...</p>
      <p className="text-sm text-brand-muted mt-2">Vui lòng đợi trong giây lát</p>
    </div>
  );
};

export default LoadingSpinner;
