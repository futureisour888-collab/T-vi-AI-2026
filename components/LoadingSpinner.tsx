import React from 'react';

interface LoadingSpinnerProps {
  imageSrc?: string | null;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ imageSrc }) => {
  if (imageSrc) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative w-64 h-80 rounded-xl overflow-hidden border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(34,211,238,0.2)] bg-black">
          {/* Background Image with filter */}
          <img 
            src={imageSrc} 
            alt="Analyzing" 
            className="w-full h-full object-cover opacity-60 filter grayscale contrast-125"
          />
          
          {/* Grid Overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
          
          {/* Scanning Laser */}
          <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-scan z-20"></div>
          
          {/* HUD Elements */}
          <div className="absolute top-4 left-4 text-[10px] text-cyan-400 font-mono">
            <p>SCANNING_MODE: BIOMETRIC_A1</p>
            <p>TARGET_ACQUIRED: TRUE</p>
          </div>
          <div className="absolute bottom-4 right-4 text-[10px] text-cyan-400 font-mono text-right">
            <p className="animate-pulse">PROCESSING DATA...</p>
            <p>ENC: AES-256</p>
          </div>

          {/* Crosshairs */}
          <div className="absolute top-1/2 left-1/2 w-8 h-8 -translate-x-1/2 -translate-y-1/2 border border-cyan-500/30"></div>
          <div className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 border border-cyan-400 rounded-full animate-ping"></div>

          {/* Random moving markers */}
          <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse-fast"></div>
          <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse-fast delay-100"></div>
        </div>
        
        <div className="mt-6 space-y-2 text-center">
          <p className="text-cyan-400 font-serif text-lg tracking-widest animate-pulse">ĐANG QUÉT SINH TRẮC...</p>
          <p className="text-xs text-cyan-600 font-mono">Đo đạc tỉ lệ Tam Đình - Ngũ Nhạc - 12 Cung Tướng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-24 h-24">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-mystic-purple rounded-full animate-ping opacity-20"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-mystic-gold border-r-transparent border-b-mystic-purple border-l-transparent rounded-full animate-spin"></div>
      </div>
      <p className="mt-6 text-mystic-gold font-serif text-lg animate-pulse">Đang thỉnh thiên cơ...</p>
    </div>
  );
};

export default LoadingSpinner;