
import React, { useState } from 'react';
import { FeatureMode, PredictionResult, UserProfile, ImageAnalysisPayload } from './types';
import ProfileForm from './components/ProfileForm';
import HoroscopeView from './components/HoroscopeView';
import ImageAnalysis from './components/ImageAnalysis';
import ResultCard from './components/ResultCard';
import DailyFeatures from './components/DailyFeatures';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorAlert from './components/ErrorAlert';
import { getHoroscopePrediction, getImageAnalysis } from './services/geminiService';
import { Moon, Hand, User, Sparkles, Calendar, LayoutDashboard, ChevronRight, Ticket, UserCircle } from 'lucide-react';

const App: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<FeatureMode>(FeatureMode.HOROSCOPE);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzingImage, setAnalyzingImage] = useState<string | null>(null);

  // Called when ProfileForm is submitted
  const handleProfileSubmit = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  const handleHoroscopeAnalyze = async () => {
    if (!userProfile) return;
    setIsLoading(true);
    setError(null);
    setAnalyzingImage(null);
    try {
      const prediction = await getHoroscopePrediction(userProfile);
      setResult(prediction);
    } catch (err: any) {
      setError(err.message || 'Hệ thống đang bận, vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageAnalyze = async (payload: ImageAnalysisPayload) => {
    setIsLoading(true);
    setError(null);
    if (payload.files.length > 0) {
      const imageUrl = URL.createObjectURL(payload.files[0]);
      setAnalyzingImage(imageUrl);
    } else {
      setAnalyzingImage(null);
    }

    try {
      let type: 'PALM' | 'FACE' | 'FORTUNE_PAPER' = 'FACE';
      if (activeTab === FeatureMode.PALM_READING) type = 'PALM';
      if (activeTab === FeatureMode.FORTUNE_PAPER) type = 'FORTUNE_PAPER';

      const prediction = await getImageAnalysis(payload, type);
      setResult(prediction);
    } catch (err: any) {
      setError(err.message || 'Không thể phân tích ảnh. Vui lòng kiểm tra lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetResult = () => {
    setResult(null);
    setError(null);
    if (analyzingImage) {
      URL.revokeObjectURL(analyzingImage);
      setAnalyzingImage(null);
    }
  };
  
  const resetProfile = () => {
    if (window.confirm("Bạn có chắc muốn tạo lại hồ sơ mới?")) {
        resetResult();
        setUserProfile(null);
    }
  };

  // 1. If No Profile -> Show Entry Form
  if (!userProfile) {
     return <ProfileForm onSubmit={handleProfileSubmit} />;
  }

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner imageSrc={analyzingImage} />;
    
    if (result) {
      return <ResultCard result={result} onReset={resetResult} imageSrc={analyzingImage} />;
    }

    switch (activeTab) {
      case FeatureMode.HOROSCOPE:
        return (
            <HoroscopeView 
                userProfile={userProfile} 
                onAnalyze={handleHoroscopeAnalyze}
                isLoading={isLoading}
            />
        );
      case FeatureMode.PALM_READING:
        return (
          <ImageAnalysis 
            type="PALM" 
            userProfile={userProfile}
            onAnalyze={handleImageAnalyze} 
            isLoading={isLoading} 
          />
        );
      case FeatureMode.FACE_READING:
        return (
          <ImageAnalysis 
            type="FACE" 
            userProfile={userProfile}
            onAnalyze={handleImageAnalyze} 
            isLoading={isLoading} 
          />
        );
      case FeatureMode.FORTUNE_PAPER:
        return (
          <ImageAnalysis 
            type="FORTUNE_PAPER" 
            userProfile={userProfile}
            onAnalyze={handleImageAnalyze} 
            isLoading={isLoading} 
          />
        );
      case FeatureMode.DAILY_READING:
        return <DailyFeatures />;
      default:
        return null;
    }
  };

  // Mobile Bottom Navigation Item
  const MobileNavItem = ({ mode, icon: Icon, label }: { mode: FeatureMode, icon: any, label: string }) => (
    <button
      onClick={() => { setActiveTab(mode); setError(null); }}
      className={`flex flex-col items-center justify-center py-2 px-1 transition-all duration-300 w-1/5 ${
        activeTab === mode ? 'text-brand-accent' : 'text-brand-muted hover:text-white'
      }`}
    >
      <div className={`p-1.5 rounded-full mb-1 transition-all ${activeTab === mode ? 'bg-brand-accent/10 translate-y-[-4px]' : ''}`}>
        <Icon size={18} className={activeTab === mode ? 'stroke-[2.5px]' : ''} />
      </div>
      <span className="text-[8px] font-medium tracking-wide whitespace-nowrap">{label}</span>
    </button>
  );

  // Desktop Sidebar Item
  const SidebarItem = ({ mode, icon: Icon, label, desc }: { mode: FeatureMode, icon: any, label: string, desc: string }) => (
    <button
      onClick={() => { setActiveTab(mode); setError(null); }}
      className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-300 group border-r-2 ${
        activeTab === mode 
          ? 'bg-gradient-to-r from-brand-secondary/80 to-transparent border-brand-accent' 
          : 'hover:bg-white/5 border-transparent'
      }`}
    >
      <div className={`p-2.5 rounded-xl transition-all ${
        activeTab === mode 
          ? 'bg-brand-accent text-brand-dark shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
          : 'bg-white/5 text-brand-muted group-hover:bg-white/10 group-hover:text-white'
      }`}>
        <Icon size={20} />
      </div>
      <div className="text-left">
        <p className={`font-bold text-sm transition-colors ${activeTab === mode ? 'text-white' : 'text-brand-muted group-hover:text-white'}`}>
          {label}
        </p>
        <p className="text-[10px] text-brand-muted/60 font-medium tracking-wide">{desc}</p>
      </div>
      {activeTab === mode && <ChevronRight size={14} className="ml-auto text-brand-accent animate-pulse" />}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-premium-gradient text-brand-text font-sans overflow-hidden selection:bg-brand-accent selection:text-brand-dark">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex flex-col w-[280px] h-screen fixed left-0 top-0 border-r border-white/5 bg-brand-dark/90 backdrop-blur-xl z-50 shadow-2xl">
        {/* Brand Logo */}
        <div className="h-20 flex items-center px-6 border-b border-white/5 cursor-pointer" onClick={resetResult}>
           <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-accent to-yellow-600 flex items-center justify-center text-brand-dark shadow-glow mr-3">
              <Sparkles size={22} />
           </div>
           <div>
              <h1 className="font-serif font-bold text-xl tracking-wide text-white">
                HUYEN BI <span className="text-brand-accent">AI</span>
              </h1>
              <p className="text-[10px] text-brand-muted uppercase tracking-widest">Master Consultant</p>
           </div>
        </div>

        {/* User Profile Summary (Small) */}
        <div className="px-6 pt-6 pb-2">
            <div className="bg-brand-secondary/30 rounded-lg p-3 border border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent border border-brand-accent/10">
                    <UserCircle size={16} />
                </div>
                <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{userProfile.name}</p>
                    <p className="text-[10px] text-brand-muted truncate">{userProfile.birthDay}/{userProfile.birthMonth}/{userProfile.birthYear}</p>
                </div>
                <button onClick={resetProfile} className="ml-auto text-[10px] text-brand-muted hover:text-red-400 p-1">
                    Thoát
                </button>
            </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
           {!result && (
             <div className="px-6 mb-4">
               <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-2 ml-1">Dịch Vụ Tư Vấn</p>
             </div>
           )}
           
           {!result ? (
             <div className="space-y-1">
                <SidebarItem mode={FeatureMode.HOROSCOPE} icon={Moon} label="Tử Vi Đẩu Số" desc="Luận giải vận hạn 2026" />
                <SidebarItem mode={FeatureMode.PALM_READING} icon={Hand} label="Sinh Trắc Chỉ Tay" desc="Phân tích đường đời, sự nghiệp" />
                <SidebarItem mode={FeatureMode.FACE_READING} icon={User} label="Diện Tướng Học" desc="Soi tâm tính, đoán vận mệnh" />
                <SidebarItem mode={FeatureMode.FORTUNE_PAPER} icon={Ticket} label="Giải Xăm/Gieo Quẻ" desc="Luận giải thơ & sở cầu" />
                <SidebarItem mode={FeatureMode.DAILY_READING} icon={Calendar} label="Bói Hàng Ngày" desc="Tarot & Số may mắn" />
             </div>
           ) : (
             <div className="px-4">
                <button 
                  onClick={resetResult}
                  className="w-full bg-brand-secondary/50 border border-white/10 p-4 rounded-xl flex items-center gap-3 hover:bg-brand-secondary transition-all"
                >
                   <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                     <LayoutDashboard size={16} />
                   </div>
                   <div className="text-left">
                     <p className="text-xs font-bold text-white">Quay Về Trang Chủ</p>
                     <p className="text-[10px] text-brand-muted">Kết thúc phiên tư vấn</p>
                   </div>
                </button>
             </div>
           )}
        </nav>

        {/* Footer Info */}
        <div className="p-6 border-t border-white/5 bg-black/20">
           <div className="bg-brand-accent/5 rounded-lg p-3 border border-brand-accent/10 mb-4">
              <p className="text-[10px] text-brand-accent leading-relaxed">
                 <span className="font-bold">✨ Vận Niên {userProfile.viewYear}:</span> AI Gemini 1.5 Pro đã sẵn sàng luận giải.
              </p>
           </div>
           <p className="text-[10px] text-brand-muted/50 text-center">© 2026 HUYEN BI TECHNOLOGY</p>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col md:pl-[280px] h-screen overflow-hidden relative">
         {/* Top Mobile Bar (Logo only) */}
         <div className="md:hidden h-14 border-b border-white/5 bg-brand-dark/90 backdrop-blur-md flex items-center justify-between px-4 z-40 shrink-0 relative">
            <div className="flex items-center gap-2" onClick={resetResult}>
               <Sparkles size={16} className="text-brand-accent" />
               <span className="font-serif font-bold text-base tracking-wide text-white">
                 HUYEN BI
               </span>
            </div>
            <div className="flex items-center gap-3">
                 <span className="text-[10px] font-bold text-brand-muted truncate max-w-[80px]">{userProfile.name}</span>
                 <button onClick={resetProfile} className="text-[10px] text-red-400 border border-red-500/30 px-2 py-0.5 rounded">Thoát</button>
            </div>
         </div>

         {/* Scrollable Content */}
         <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-24 md:p-8 md:pb-8 scroll-smooth">
           {/* Mobile Header Hero (Only when no result) */}
           {!result && !isLoading && (
              <div className="md:hidden text-center mb-6 mt-4">
                 <h2 className="text-2xl font-serif font-bold text-white mb-2">
                   Vận Mệnh <span className="text-gold">{userProfile.viewYear}</span>
                 </h2>
                 <p className="text-xs text-brand-muted px-8">Hệ thống AI số 1 về Tử vi & Nhân tướng học.</p>
              </div>
           )}
           
           {/* Error Alert */}
           {error && (
             <div className="max-w-4xl mx-auto">
               <ErrorAlert message={error} onClose={() => setError(null)} />
             </div>
           )}

           {/* Content */}
           <div className="transition-all duration-500">
             {renderContent()}
           </div>
         </div>
      </div>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      {!result && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-brand-dark/95 backdrop-blur-xl border-t border-white/10 z-50 flex justify-around items-center px-1 pb-safe">
           <MobileNavItem mode={FeatureMode.HOROSCOPE} icon={Moon} label="Tử Vi" />
           <MobileNavItem mode={FeatureMode.PALM_READING} icon={Hand} label="Chỉ Tay" />
           <MobileNavItem mode={FeatureMode.FACE_READING} icon={User} label="Tướng Mặt" />
           <MobileNavItem mode={FeatureMode.FORTUNE_PAPER} icon={Ticket} label="Giải Xăm" />
           <MobileNavItem mode={FeatureMode.DAILY_READING} icon={Calendar} label="Bói Ngày" />
        </div>
      )}
    </div>
  );
};

export default App;
