import React, { useState } from 'react';
import { Sparkles, RefreshCcw, Quote, Palette, Hash } from 'lucide-react';
import { getDailyTarotReading, getDailyLuckyStats } from '../services/geminiService';
import { DailyTarotResult, DailyLuckyResult } from '../types';
import LoadingSpinner from './LoadingSpinner';

const DailyFeatures: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'TAROT' | 'LUCKY'>('TAROT');
  const [isLoading, setIsLoading] = useState(false);
  const [tarotResult, setTarotResult] = useState<DailyTarotResult | null>(null);
  const [luckyResult, setLuckyResult] = useState<DailyLuckyResult | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleDrawCard = async () => {
    setIsLoading(true);
    setTarotResult(null);
    setIsFlipped(false);
    try {
      // Simulate shuffle delay
      await new Promise(r => setTimeout(r, 800));
      const result = await getDailyTarotReading();
      setTarotResult(result);
      // Auto flip after loading
      setTimeout(() => setIsFlipped(true), 100);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetLucky = async () => {
    setIsLoading(true);
    setLuckyResult(null);
    try {
      const result = await getDailyLuckyStats();
      setLuckyResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      {/* Sub-navigation */}
      <div className="flex justify-center mb-6 md:mb-8">
        <div className="inline-flex bg-brand-secondary/50 p-1 rounded-xl border border-white/5 backdrop-blur-sm w-full md:w-auto">
          <button
            onClick={() => setActiveTab('TAROT')}
            className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 rounded-lg text-xs md:text-sm font-bold uppercase tracking-wider transition-all ${
              activeTab === 'TAROT' 
                ? 'bg-brand-accent text-brand-dark shadow-glow' 
                : 'text-brand-muted hover:text-white'
            }`}
          >
            Tarot
          </button>
          <button
            onClick={() => setActiveTab('LUCKY')}
            className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 rounded-lg text-xs md:text-sm font-bold uppercase tracking-wider transition-all ${
              activeTab === 'LUCKY' 
                ? 'bg-brand-accent text-brand-dark shadow-glow' 
                : 'text-brand-muted hover:text-white'
            }`}
          >
            Vận May
          </button>
        </div>
      </div>

      {/* TAROT SECTION */}
      {activeTab === 'TAROT' && (
        <div className="glass-card p-4 md:p-8 rounded-2xl min-h-[400px] md:min-h-[500px] flex flex-col items-center justify-center text-center relative overflow-hidden">
          {!tarotResult && !isLoading && (
            <div className="space-y-6 md:space-y-8 z-10 w-full">
              <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i}
                    onClick={handleDrawCard}
                    className="w-24 h-40 md:w-32 md:h-52 bg-brand-secondary border-2 border-brand-accent/30 rounded-lg cursor-pointer hover:-translate-y-4 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all duration-300 flex items-center justify-center group relative overflow-hidden active:scale-95 touch-manipulation"
                  >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    <div className="w-10 h-10 md:w-16 md:h-16 rounded-full border border-brand-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Sparkles className="text-brand-accent/50 w-5 h-5 md:w-8 md:h-8" />
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-serif text-white mb-2">Thông Điệp Vũ Trụ</h3>
                <p className="text-brand-muted text-xs md:text-sm">Hãy tập trung năng lượng vào ngày hôm nay và chọn một lá bài.</p>
              </div>
            </div>
          )}

          {isLoading && <LoadingSpinner />}

          {tarotResult && !isLoading && (
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 w-full z-10 animate-fade-in">
              {/* Card Reveal */}
              <div className="relative w-48 h-72 md:w-64 md:h-96 perspective-1000 shrink-0">
                <div className={`relative w-full h-full transition-all duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                  {/* Front (Back of card actually) */}
                  <div className="absolute inset-0 backface-hidden bg-brand-secondary border-2 border-brand-accent rounded-xl flex items-center justify-center">
                    <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                  </div>
                  {/* Back (Face of card) */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-brand-primary to-black border-2 border-brand-accent rounded-xl overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.2)] flex flex-col items-center justify-center p-4">
                     <div className="w-full h-2/3 border border-white/10 rounded-lg bg-black/30 flex items-center justify-center mb-4 relative overflow-hidden">
                        <div className="absolute inset-0 bg-brand-accent/10 animate-pulse"></div>
                        <span className="text-4xl md:text-6xl">🔮</span>
                     </div>
                     <h4 className="text-lg md:text-xl font-serif text-brand-accent font-bold uppercase text-center leading-tight">{tarotResult.cardName}</h4>
                  </div>
                </div>
              </div>

              {/* Interpretation */}
              <div className="flex-1 text-left space-y-4 md:space-y-6 w-full">
                <div>
                  <h3 className="text-2xl md:text-3xl font-serif text-white mb-2 text-center md:text-left">{tarotResult.cardName}</h3>
                  <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
                    {tarotResult.keywords.map((kw, idx) => (
                      <span key={idx} className="px-2 py-1 md:px-3 bg-brand-accent/10 border border-brand-accent/20 rounded-full text-[10px] md:text-xs text-brand-accent whitespace-nowrap">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="bg-brand-secondary/30 p-4 md:p-6 rounded-xl border-l-2 border-brand-accent">
                   <p className="text-brand-text leading-relaxed text-base md:text-lg italic text-center md:text-left">"{tarotResult.message}"</p>
                </div>

                <div className="prose prose-invert prose-sm text-brand-muted text-sm leading-relaxed">
                  <p>{tarotResult.cardMeaning}</p>
                </div>

                <div className="flex justify-center md:justify-start">
                    <button 
                    onClick={handleDrawCard}
                    className="flex items-center gap-2 text-brand-accent hover:text-white transition-colors text-sm font-bold uppercase tracking-wider mt-2 px-4 py-2 border border-brand-accent/30 rounded-lg hover:bg-brand-accent/10"
                    >
                    <RefreshCcw size={14} /> Bốc Lại
                    </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LUCKY SECTION */}
      {activeTab === 'LUCKY' && (
        <div className="glass-card p-6 md:p-12 rounded-2xl min-h-[500px] flex flex-col items-center justify-center text-center relative overflow-hidden">
           {!luckyResult && !isLoading && (
              <div className="space-y-6 md:space-y-8 z-10">
                <div className="relative">
                   <div className="absolute inset-0 bg-brand-accent/20 blur-[50px] rounded-full"></div>
                   <button 
                      onClick={handleGetLucky}
                      className="relative w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-brand-accent/30 bg-brand-dark/50 flex flex-col items-center justify-center gap-2 hover:scale-105 hover:border-brand-accent transition-all duration-500 group shadow-[0_0_30px_rgba(212,175,55,0.1)] active:scale-95 touch-manipulation"
                   >
                      <Sparkles size={32} className="text-brand-accent animate-pulse md:w-10 md:h-10" />
                      <span className="font-serif text-base md:text-lg text-white font-bold group-hover:text-brand-accent transition-colors">Khai Vận</span>
                   </button>
                </div>
                <p className="text-brand-muted max-w-md mx-auto text-sm">
                  Khám phá màu sắc và con số mang lại năng lượng tích cực nhất cho bạn trong ngày hôm nay.
                </p>
              </div>
           )}

           {isLoading && <LoadingSpinner />}

           {luckyResult && !isLoading && (
              <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 animate-fade-in z-10">
                 {/* Color Card */}
                 <div className="bg-brand-secondary/40 p-4 md:p-6 rounded-2xl border border-white/5 flex flex-col items-center gap-3 md:gap-4 group hover:bg-brand-secondary/60 transition-colors">
                    <div className="flex items-center gap-2 text-brand-muted text-xs uppercase tracking-widest font-bold">
                       <Palette size={14} /> Màu May Mắn
                    </div>
                    <div 
                       className="w-20 h-20 md:w-24 md:h-24 rounded-full shadow-inner border-4 border-white/10 transition-transform group-hover:scale-110 duration-500"
                       style={{ backgroundColor: luckyResult.hexCode, boxShadow: `0 0 30px ${luckyResult.hexCode}60` }}
                    ></div>
                    <div className="text-center">
                       <h3 className="text-xl md:text-2xl font-serif text-white">{luckyResult.color}</h3>
                       <p className="text-brand-muted font-mono text-xs md:text-sm opacity-50">{luckyResult.hexCode}</p>
                    </div>
                 </div>

                 {/* Number Card */}
                 <div className="bg-brand-secondary/40 p-4 md:p-6 rounded-2xl border border-white/5 flex flex-col items-center gap-3 md:gap-4 group hover:bg-brand-secondary/60 transition-colors">
                    <div className="flex items-center gap-2 text-brand-muted text-xs uppercase tracking-widest font-bold">
                       <Hash size={14} /> Số Vượng Khí
                    </div>
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-brand-accent/20 flex items-center justify-center bg-brand-dark/50 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] group-hover:border-brand-accent transition-colors">
                       <span className="text-3xl md:text-4xl font-bold text-brand-accent">{luckyResult.number}</span>
                    </div>
                    <div className="text-center">
                       <h3 className="text-lg md:text-xl font-serif text-white">Số May Mắn</h3>
                       <p className="text-brand-muted text-xs">Mang lại tài lộc</p>
                    </div>
                 </div>

                 {/* Quote Card - Full Width */}
                 <div className="col-span-1 md:col-span-2 bg-gradient-to-r from-brand-secondary/40 to-brand-primary/40 p-6 md:p-8 rounded-2xl border border-white/5 relative overflow-hidden">
                    <Quote className="absolute top-4 left-4 text-brand-accent/10 w-12 h-12 md:w-16 md:h-16" />
                    <div className="relative z-10 text-center space-y-2">
                       <p className="text-[10px] md:text-xs text-brand-accent font-bold uppercase tracking-widest mb-2">Lời Khuyên Trong Ngày</p>
                       <p className="text-base md:text-xl font-serif text-white italic leading-relaxed">
                          "{luckyResult.quote}"
                       </p>
                    </div>
                 </div>

                 <div className="col-span-1 md:col-span-2 text-center">
                    <button 
                      onClick={handleGetLucky}
                      className="text-brand-muted hover:text-white text-xs underline decoration-brand-accent/50 underline-offset-4 transition-colors p-2"
                    >
                       Xem lại vận hạn
                    </button>
                 </div>
              </div>
           )}
        </div>
      )}
    </div>
  );
};

export default DailyFeatures;
