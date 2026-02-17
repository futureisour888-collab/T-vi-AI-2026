
import React from 'react';
import { UserProfile } from '../types';
import { Sparkles, Moon } from 'lucide-react';

interface HoroscopeViewProps {
  userProfile: UserProfile;
  onAnalyze: () => void;
  isLoading: boolean;
}

const HoroscopeView: React.FC<HoroscopeViewProps> = ({ userProfile, onAnalyze, isLoading }) => {
  return (
    <div className="max-w-xl mx-auto glass-card p-6 md:p-10 rounded-2xl animate-fade-in-up text-center">
      <div className="mb-8 flex justify-center">
         <div className="w-20 h-20 rounded-full bg-brand-secondary/50 border-2 border-brand-accent/20 flex items-center justify-center shadow-glow">
            <Moon size={40} className="text-brand-accent animate-pulse" />
         </div>
      </div>

      <h3 className="text-xl md:text-2xl font-serif text-white mb-4">Luận Giải Tử Vi {userProfile.viewYear}</h3>
      
      <div className="bg-brand-secondary/40 p-4 rounded-xl border border-white/5 mb-8 text-left inline-block w-full">
         <div className="grid grid-cols-2 gap-y-2 text-sm">
             <div className="text-brand-muted">Tín chủ:</div>
             <div className="text-white font-bold text-right">{userProfile.name}</div>
             
             <div className="text-brand-muted">Ngày sinh:</div>
             <div className="text-white font-bold text-right">
                {userProfile.birthDay}/{userProfile.birthMonth}/{userProfile.birthYear} ({userProfile.calendarType === 'solar' ? 'DL' : 'AL'})
             </div>

             <div className="text-brand-muted">Giờ sinh:</div>
             <div className="text-white font-bold text-right">{userProfile.birthTimeStr}</div>

             <div className="text-brand-muted">Xem vận hạn:</div>
             <div className="text-brand-accent font-bold text-right">Năm {userProfile.viewYear}</div>
         </div>
      </div>

      <button
        onClick={onAnalyze}
        disabled={isLoading}
        className="w-full btn-gold py-4 rounded-lg text-brand-dark font-bold uppercase tracking-widest text-sm disabled:opacity-70 disabled:cursor-not-allowed touch-manipulation shadow-lg hover:shadow-xl transition-all"
      >
        {isLoading ? 'Đang Luận Giải...' : 'Bắt Đầu Luận Giải Chi Tiết'}
      </button>
      
      <p className="text-brand-muted text-xs mt-4 italic">
        *Hệ thống sẽ phân tích lá số dựa trên Thiên Can, Địa Chi và Ngũ Hành của năm {userProfile.viewYear}.
      </p>
    </div>
  );
};

export default HoroscopeView;
