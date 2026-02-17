import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onClose: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onClose }) => {
  return (
    <div className="mb-8 relative overflow-hidden rounded-xl border border-red-500/30 bg-red-950/30 backdrop-blur-md p-4 md:p-5 shadow-lg animate-fade-in group">
      {/* Decorative background elements */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-red-500/20 transition-colors duration-500"></div>
      <div className="absolute bottom-0 left-0 w-1 h-full bg-red-500/50"></div>
      
      <div className="flex items-start gap-4 relative z-10">
        <div className="shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)] mt-0.5">
          <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
        </div>
        
        <div className="flex-grow">
          <h3 className="text-red-400 font-bold text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
            Hệ Thống Gặp Sự Cố
          </h3>
          <p className="text-red-100/80 text-sm leading-relaxed font-light tracking-wide">{message}</p>
        </div>
        
        <button 
          onClick={onClose}
          className="shrink-0 p-2 text-red-400/70 hover:text-white hover:bg-red-500/20 rounded-lg transition-all duration-300 group/btn"
          aria-label="Close error"
        >
          <X size={18} className="group-hover/btn:rotate-90 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
};

export default ErrorAlert;
