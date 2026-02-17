
import React, { useState } from 'react';
import { PredictionResult } from '../types';
import ReactMarkdown from 'react-markdown';
import { Compass, Heart, Briefcase, Coins, Activity, Sparkles, ScanLine, FileText, Download, ChevronRight, ScrollText, Lightbulb, UserCircle, Calendar, Target, Image as ImageIcon, BookOpen, AlertOctagon, Ban, CheckCircle2, AlertTriangle } from 'lucide-react';
import ChatConsultant from './ChatConsultant';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ResultCardProps {
  result: PredictionResult;
  onReset: () => void;
  imageSrc?: string | null;
}

type TabType = 'overview' | 'details' | 'advice' | 'chat';

const ResultCard: React.FC<ResultCardProps> = ({ result, onReset, imageSrc }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isExporting, setIsExporting] = useState(false);

  // Helper function to map text color to Hex
  const getColorHex = (colorName: string): string => {
    const lower = colorName.toLowerCase().trim();
    if (lower.includes('đỏ')) return '#DC2626';
    if (lower.includes('xanh lá') || lower.includes('lục')) return '#16A34A';
    if (lower.includes('xanh dương') || lower.includes('lam') || lower.includes('nước')) return '#2563EB';
    if (lower.includes('vàng')) return '#CA8A04';
    if (lower.includes('trắng') || lower.includes('kim') || lower.includes('bạc')) return '#F1F5F9';
    if (lower.includes('đen') || lower.includes('huyền')) return '#0F172A';
    if (lower.includes('tím')) return '#9333EA';
    if (lower.includes('hồng')) return '#DB2777';
    if (lower.includes('cam')) return '#EA580C';
    if (lower.includes('xám') || lower.includes('ghi')) return '#64748B';
    if (lower.includes('nâu')) return '#78350F';
    return '#D4AF37'; // Default Gold
  };

  const getColors = (colorString: string | undefined): string[] => {
    if (!colorString) return [];
    return colorString.split(/,|và|\//).map(s => s.trim()).filter(s => s.length > 0);
  };

  const captureAndDownloadPdf = async () => {
    const templateId = 'print-template';
    const element = document.getElementById(templateId);
    
    if (!element) return;

    setIsExporting(true);

    const clone = element.cloneNode(true) as HTMLElement;
    
    clone.classList.remove('hidden');
    clone.id = 'print-template-clone';
    
    // Set width for A4 consistency, but allow height to be auto to fit content
    Object.assign(clone.style, {
        display: 'block',
        position: 'fixed',
        top: '-10000px',
        left: '0',
        width: '794px', // 96 DPI A4 Width
        height: 'auto', // Allow expansion
        minHeight: '1123px',
        zIndex: '-1000',
        backgroundColor: '#fdfbf7',
    });
    
    document.body.appendChild(clone);
    // Wait for DOM to stabilize
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        const canvas = await html2canvas(clone, {
            scale: 2, // High quality
            useCORS: true,
            logging: false,
            width: 794, // Lock width
            windowWidth: 794,
            backgroundColor: '#fdfbf7',
            onclone: (clonedDoc) => {
               const el = clonedDoc.getElementById('print-template-clone');
               if(el) el.style.display = 'block';
            }
        });

        // Calculate dynamic PDF height to fit all content on "one page"
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Create PDF with custom height matching the content
        const pdf = new jsPDF('p', 'mm', [imgWidth, pageHeight]);
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, pageHeight); 
        
        const fileName = result.userAttributes?.name 
          ? `HuyenBi-AI-Report-${result.userAttributes.name.replace(/\s+/g, '-')}.pdf`
          : `HuyenBi-AI-${Date.now()}.pdf`;
        pdf.save(fileName);

    } catch (error) {
        console.error("Export failed", error);
        alert("Có lỗi khi xuất file.");
    } finally {
        if (document.body.contains(clone)) {
            document.body.removeChild(clone);
        }
        setIsExporting(false);
    }
  };

  // Helper to split content into Pros (Green) and Cons (Red)
  const renderDetailContent = (content: string, isPrintMode: boolean = false) => {
    if (!content) return null;

    let pros = content;
    let cons = '';

    // Improved splitting logic to handle inconsistencies like inline warnings or typos (e.g., "CẢSHIP CÁO")
    // We split primarily by the Warning Emoji ⚠️ which is consistent in the prompt.
    if (content.includes('⚠️')) {
       const parts = content.split('⚠️');
       pros = parts[0].trim();
       cons = parts.slice(1).join(' ').trim();
       
       // Clean up the label from the start of the Warning text
       // Regex to remove "CẢNH BÁO:", "**CẢNH BÁO**:", or weird typos ending in "CÁO" followed by colon
       cons = cons.replace(/^(?:\*\*|)\s*(?:CẢNH BÁO|LƯU Ý|.*?CÁO)(?:\*\*|)(?::|)\s*/i, '');
    } else {
       // Fallback: Split by text "CẢNH BÁO" if emoji is missing
       // Looks for bold or standard "CẢNH BÁO:"
       const parts = content.split(/(?:\*\*|)\s*CẢNH BÁO(?:\*\*|):/i);
       if (parts.length > 1) {
          pros = parts[0].trim();
          cons = parts.slice(1).join(' ').trim();
       }
    }

    // Clean up "ĐIỂM SÁNG" label from pros
    // Removes "✅ ĐIỂM SÁNG:", "**✅ ĐIỂM SÁNG**:", etc.
    pros = pros.replace(/^(?:\*\*|)\s*✅\s*(?:ĐIỂM SÁNG|CƠ HỘI|ƯU ĐIỂM|.*?)(?:\*\*|)(?::|)\s*/i, '').trim();
    
    // Final fallback cleanup for any leading colons or stars
    if (pros.startsWith(':')) pros = pros.substring(1).trim();
    if (cons.startsWith(':')) cons = cons.substring(1).trim();

    const textColorClass = isPrintMode ? 'text-gray-800' : 'text-gray-300';
    const bgGreen = isPrintMode ? 'bg-green-500/5 border-green-500/20' : 'bg-green-500/10 border-green-500/30';
    const bgRed = isPrintMode ? 'bg-red-500/5 border-red-500/20' : 'bg-red-500/10 border-red-500/30';

    return (
      <div className="space-y-2 mt-1">
         {/* Opportunities Block */}
         {pros && (
            <div className={`border rounded p-2 ${bgGreen}`}>
               <h5 className="text-green-600 font-bold text-[10px] uppercase mb-1 flex items-center gap-1">
                  <CheckCircle2 size={10} /> Điểm Sáng
               </h5>
               <div className={`text-[11px] leading-snug text-justify ${textColorClass}`}>
                  <ReactMarkdown>{pros}</ReactMarkdown>
               </div>
            </div>
         )}

         {/* Warnings Block */}
         {cons && (
            <div className={`border rounded p-2 ${bgRed}`}>
               <h5 className="text-red-600 font-bold text-[10px] uppercase mb-1 flex items-center gap-1">
                  <AlertTriangle size={10} /> Cảnh Báo
               </h5>
               <div className={`text-[11px] leading-snug text-justify ${textColorClass}`}>
                  <ReactMarkdown>{cons}</ReactMarkdown>
               </div>
            </div>
         )}
      </div>
    );
  };

  const fortune = result.fortuneContent;
  const displayPoem = fortune?.poem_viet || (result.overview.includes('**💡 GIẢI NGHĨA:**') ? result.overview.split('**💡 GIẢI NGHĨA:**')[0].replace('**📜 NỘI DUNG QUẺ:**', '').trim() : '');
  const displayMeaning = fortune?.meaning_details || (result.overview.includes('**💡 GIẢI NGHĨA:**') ? result.overview.split('**💡 GIẢI NGHĨA:**')[1].trim() : result.overview);
  const hasData = (text: string) => text && text.trim().length > 5 && text !== 'null';

  const luckyColorsList = getColors(result.luckyColor);
  const unluckyColorsList = getColors(result.unluckyColor);

  return (
    <div className="max-w-6xl mx-auto">
      
      {/* --- RE-DESIGNED PRINT TEMPLATE (Auto Height) --- */}
      <div id="print-template" className="hidden bg-[#fdfbf7] text-gray-900 font-serif leading-snug">
          <div className="w-[794px] min-h-[1123px] h-auto relative bg-[#fdfbf7] flex flex-col pb-8">
            
            {/* 1. Header Stripe */}
            <div className="bg-[#0f172a] text-white px-8 py-5 flex justify-between items-center border-b-4 border-[#daaa3f] shrink-0">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-[#daaa3f] text-[#0f172a] flex items-center justify-center font-bold rounded shadow-lg">AI</div>
                   <div>
                      <div className="flex items-center gap-4">
                          <h1 className="text-2xl font-bold uppercase tracking-[0.15em] text-[#daaa3f] leading-none">SỚ GIẢI XÂM</h1>
                          {/* MOVED: Fortune Nature to Header */}
                          {fortune?.nature && (
                              <span className={`px-5 py-2 text-[12px] font-bold uppercase tracking-wider rounded-full border border-white/20 shadow-lg inline-flex items-center justify-center ${
                                  fortune.nature.includes('Thượng') || fortune.nature.includes('Cát') ? 'bg-red-700 text-white' : 'bg-gray-600 text-gray-200'
                              }`}>
                                  {fortune.nature}
                              </span>
                          )}
                      </div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Niên Can Bính Ngọ 2026</p>
                   </div>
                </div>
                {result.userAttributes && (
                   <div className="text-right">
                       <h2 className="text-lg font-bold uppercase tracking-wide">{result.userAttributes.name}</h2>
                       <p className="text-[11px] text-gray-300 opacity-80">{result.userAttributes.lunarDate} • {result.userAttributes.gender === 'male' ? 'Nam Mạng' : 'Nữ Mạng'}</p>
                   </div>
                )}
            </div>

            {/* 2. Stats Bar */}
            <div className="bg-white border-b border-[#e2dcc8] px-8 py-4 flex items-center justify-between shadow-sm shrink-0">
                {/* Luck Score */}
                <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-full border-[4px] border-[#daaa3f] flex items-center justify-center bg-[#fffdf5]">
                        <span className="text-xl font-bold text-[#daaa3f]">{result.luckScore}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Điểm Vận</span>
                        <span className="text-base font-bold text-gray-800 uppercase">
                          {result.luckScore >= 80 ? 'Đại Cát' : result.luckScore >= 50 ? 'Trung Bình' : 'Hung Hiểm'}
                        </span>
                    </div>
                </div>

                {/* Colors & Number */}
                <div className="flex items-center gap-8">
                    {/* Lucky Colors */}
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-green-600 uppercase mb-1 flex items-center gap-1"><Sparkles size={10} /> Màu Hợp</span>
                        <div className="flex gap-1">
                            {luckyColorsList.map((c, i) => (
                                <div key={i} className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: getColorHex(c) }}></div>
                            ))}
                        </div>
                    </div>

                    {/* Unlucky Colors */}
                    {unluckyColorsList.length > 0 && (
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-red-500 uppercase mb-1 flex items-center gap-1"><Ban size={10} /> Màu Kỵ</span>
                            <div className="flex gap-1">
                                {unluckyColorsList.map((c, i) => (
                                    <div key={i} className="w-4 h-4 rounded-full border border-black/10 relative" style={{ backgroundColor: getColorHex(c) }}>
                                         <div className="absolute inset-0 flex items-center justify-center text-white/70 font-bold text-[8px] bg-black/20">x</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Number */}
                    <div className="flex flex-col items-center pl-4 border-l border-gray-200">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Số May Mắn</span>
                        <span className="text-lg font-bold text-[#daaa3f]">{result.luckyNumber}</span>
                    </div>
                </div>
            </div>

            {/* 3. Main Content Flow */}
            <div className="px-8 py-6 space-y-6">
                
                {/* Section A: Poem & Meaning (Full Width) */}
                <div className="flex gap-6">
                     {/* Left: Poem Box */}
                     {displayPoem && (
                        <div className="w-5/12 bg-[#fff9e6] border border-[#daaa3f]/30 p-4 rounded text-center shrink-0">
                             {fortune && (
                                <div className="mb-2">
                                     {/* REMOVED: Old Nature Badge was here */}
                                    <h3 className="text-lg font-bold text-[#8b5a2b] font-serif">{fortune.name}</h3>
                                    <p className="text-[10px] text-gray-500 font-serif italic mb-2">{fortune.poem_han}</p>
                                </div>
                             )}
                             <div className="text-sm font-medium text-[#2d3748] italic whitespace-pre-line leading-relaxed font-serif">
                                 {displayPoem}
                             </div>
                        </div>
                     )}

                     {/* Right: General Meaning */}
                     <div className="flex-1">
                         <h3 className="font-bold text-[#8b5a2b] text-xs uppercase tracking-widest mb-2 border-b border-gray-200 pb-1 flex items-center gap-2">
                             <Lightbulb size={14} /> Tổng Quát & Giải Nghĩa
                         </h3>
                         <div className="text-xs text-justify leading-6 text-gray-800">
                             <ReactMarkdown>{displayMeaning}</ReactMarkdown>
                         </div>
                         {fortune?.legend && (
                            <div className="mt-3 bg-gray-50 p-2 rounded border border-gray-100">
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><BookOpen size={10} /> Điển Tích</h4>
                                <p className="text-[11px] text-gray-600 italic leading-snug">{fortune.legend}</p>
                            </div>
                         )}
                         {result.userAttributes?.wishes && (
                             <div className="mt-3 text-[10px] text-gray-500">
                                 <span className="font-bold">Sở Cầu:</span> {result.userAttributes.wishes.join(', ')}
                             </div>
                         )}
                     </div>
                </div>

                {/* Section B: 4 Categories Grid */}
                <div>
                    <h3 className="font-bold text-[#0f172a] text-center text-sm uppercase tracking-[0.2em] mb-4 border-t border-b border-gray-200 py-2">
                        Chi Tiết Luận Giải Vận Hạn
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        {/* Career */}
                        {hasData(result.details.career) && (
                            <div className="border border-gray-200 rounded p-3 bg-white">
                                <h4 className="font-bold text-[#2b6cb0] uppercase text-[11px] mb-2 flex items-center gap-2 pb-1 border-b border-blue-100">
                                   <Briefcase size={12} /> Công Danh & Sự Nghiệp
                                </h4>
                                {renderDetailContent(result.details.career, true)}
                            </div>
                        )}
                        
                        {/* Finance */}
                        {hasData(result.details.finance) && (
                            <div className="border border-gray-200 rounded p-3 bg-white">
                                <h4 className="font-bold text-[#b7791f] uppercase text-[11px] mb-2 flex items-center gap-2 pb-1 border-b border-yellow-100">
                                   <Coins size={12} /> Tài Lộc & Tài Chính
                                </h4>
                                {renderDetailContent(result.details.finance, true)}
                            </div>
                        )}

                        {/* Love */}
                        {hasData(result.details.love) && (
                            <div className="border border-gray-200 rounded p-3 bg-white">
                                <h4 className="font-bold text-[#d53f8c] uppercase text-[11px] mb-2 flex items-center gap-2 pb-1 border-b border-pink-100">
                                   <Heart size={12} /> Tình Duyên & Gia Đạo
                                </h4>
                                {renderDetailContent(result.details.love, true)}
                            </div>
                        )}

                        {/* Health */}
                        {hasData(result.details.health) && (
                            <div className="border border-gray-200 rounded p-3 bg-white">
                                <h4 className="font-bold text-[#2f855a] uppercase text-[11px] mb-2 flex items-center gap-2 pb-1 border-b border-green-100">
                                   <Activity size={12} /> Sức Khỏe & Thể Chất
                                </h4>
                                {renderDetailContent(result.details.health, true)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Section C: Advice */}
                <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                     <h4 className="font-bold text-[#8b5a2b] uppercase text-[11px] mb-2 tracking-widest flex items-center gap-2">
                        <FileText size={12} /> Lời Khuyên Chiến Lược
                     </h4>
                     <div className="text-xs italic text-gray-700 leading-6 font-serif text-justify">
                        <ReactMarkdown>{result.advice}</ReactMarkdown>
                     </div>
                </div>

            </div>

            {/* Footer */}
             <div className="mt-auto pt-4 px-8 pb-4 text-center">
                 <div className="text-[9px] text-gray-400 uppercase tracking-widest">
                     Generated by Huyen Bi AI • {new Date().toLocaleDateString('vi-VN')}
                 </div>
             </div>
          </div>
      </div>
      {/* --- END PRINT TEMPLATE --- */}

      <div id="result-card-container" className="glass-card rounded-xl animate-fade-in-up overflow-hidden flex flex-col shadow-2xl">
        
        {/* Report Header */}
        <div className="bg-brand-secondary/50 border-b border-white/5 p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="w-full md:w-auto">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-brand-accent/20 text-brand-accent text-[10px] font-bold px-2 py-0.5 rounded border border-brand-accent/20">PREMIUM REPORT</span>
              <span className="text-brand-muted text-[10px]">ID: #{Math.floor(Math.random() * 100000)}</span>
            </div>
            <h2 className="text-lg md:text-2xl font-serif text-white leading-tight">{result.title}</h2>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            {/* REMOVED IMAGE EXPORT BUTTON */}
            <button 
              onClick={captureAndDownloadPdf}
              disabled={isExporting}
              className="flex-1 md:flex-none justify-center flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-brand-text border border-white/10 transition-colors touch-manipulation disabled:opacity-50"
            >
                <Download size={14} /> <span className="hidden md:inline">{isExporting ? 'Đang tạo...' : 'Lưu PDF (1 Trang)'}</span> <span className="md:hidden">PDF</span>
            </button>
            <button onClick={onReset} className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 rounded-lg btn-gold text-xs font-bold shadow-glow touch-manipulation text-brand-dark">
                <Sparkles size={14} /> Tra Cứu Mới
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-grow min-h-[600px]">
          
          {/* Left Column */}
          <div className="lg:w-1/3 bg-brand-dark/30 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col">
            
            {/* User Attributes Display */}
            {result.userAttributes && (
                <div className="p-4 border-b border-white/5 bg-brand-primary/50">
                    <h3 className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-3">Thông Tin Tín Chủ</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-secondary flex items-center justify-center border border-white/10">
                                <UserCircle size={16} className="text-brand-accent" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">{result.userAttributes.name}</p>
                                <p className="text-[10px] text-brand-muted">Giới tính: {result.userAttributes.gender === 'male' ? 'Nam' : 'Nữ'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-secondary flex items-center justify-center border border-white/10">
                                <Calendar size={16} className="text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">{result.userAttributes.lunarDate}</p>
                                <p className="text-[10px] text-brand-muted">{result.userAttributes.birthDate} (Dương lịch)</p>
                            </div>
                        </div>
                        {result.userAttributes.wishes && result.userAttributes.wishes.length > 0 && (
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-brand-secondary flex items-center justify-center border border-white/10 shrink-0">
                                    <Target size={16} className="text-red-400" />
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {result.userAttributes.wishes.map((wish, idx) => (
                                        <span key={idx} className="px-1.5 py-0.5 rounded bg-brand-accent/10 border border-brand-accent/20 text-[10px] text-brand-accent">
                                            {wish}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Image Section */}
            {imageSrc ? (
                  <div className="relative w-full aspect-square lg:aspect-auto lg:h-[300px] overflow-hidden group border-b border-white/5 bg-black">
                  <img src={imageSrc} alt="Analyzed" className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700" />
                  <div className="absolute inset-0 z-10 pointer-events-none hidden lg:block">
                      <div className="w-full h-full bg-grid-pattern opacity-10"></div>
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-2 py-1 rounded text-[9px] text-brand-accent border border-brand-accent/20">
                      ANALYZED
                      </div>
                  </div>
                  </div>
              ) : (
                  <div className="w-full h-[150px] bg-brand-dark/50 flex flex-col items-center justify-center border-b border-white/5 p-2 text-center">
                      <Compass className="w-8 h-8 lg:w-12 lg:h-12 text-brand-accent mb-2 opacity-50" />
                      <p className="text-[10px] lg:text-sm text-brand-muted">Phân tích Thiên Can - Địa Chi</p>
                  </div>
              )}

              {/* Stats Grid */}
              <div className="flex-1 p-4 grid grid-cols-2 gap-3 content-start bg-brand-dark/20">
                  <div className="col-span-2 bg-brand-secondary/40 p-3 rounded-lg border border-white/5 text-center flex flex-row items-center justify-between px-4">
                      <span className="text-xs text-brand-muted uppercase">Điểm Vận</span>
                      <span className="text-xl font-bold text-green-400">{result.luckScore}<span className="text-xs text-gray-500">/100</span></span>
                  </div>
                  
                  {/* Lucky Color */}
                  <div className="bg-brand-secondary/40 p-3 rounded-lg border border-white/5 text-center flex flex-col items-center">
                      <span className="block text-[10px] text-brand-muted uppercase mb-2 flex items-center gap-1"><Sparkles size={10} /> Màu Hợp</span>
                      <div className="flex -space-x-2">
                         {luckyColorsList.map((c, i) => (
                           <div 
                              key={i}
                              className="w-6 h-6 rounded-full border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)] z-10"
                              style={{ backgroundColor: getColorHex(c) }}
                              title={c}
                           ></div>
                         ))}
                      </div>
                      <span className="text-[10px] font-bold text-brand-text truncate mt-1 max-w-full px-1">{result.luckyColor}</span>
                  </div>

                  {/* Unlucky Color */}
                  <div className="bg-brand-secondary/40 p-3 rounded-lg border border-white/5 text-center flex flex-col items-center">
                      <span className="block text-[10px] text-brand-muted uppercase mb-2 flex items-center gap-1"><Ban size={10} /> Màu Kỵ</span>
                      {unluckyColorsList.length > 0 ? (
                        <>
                            <div className="flex -space-x-2">
                                {unluckyColorsList.map((c, i) => (
                                <div 
                                    key={i}
                                    className="w-6 h-6 rounded-full border border-white/20 shadow-sm z-10 relative overflow-hidden"
                                    style={{ backgroundColor: getColorHex(c) }}
                                    title={c}
                                >
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white/50 text-[10px]">✕</div>
                                </div>
                                ))}
                            </div>
                            <span className="text-[10px] font-bold text-brand-text truncate mt-1 max-w-full px-1">{result.unluckyColor}</span>
                        </>
                      ) : (
                          <span className="text-[10px] text-gray-500 mt-2">Không có</span>
                      )}
                  </div>

                  {/* Lucky Number */}
                  <div className="col-span-2 bg-brand-secondary/40 p-3 rounded-lg border border-white/5 text-center">
                      <span className="block text-[10px] text-brand-muted uppercase mb-1">Số May Mắn</span>
                      <span className="text-xl font-bold text-blue-400">{result.luckyNumber}</span>
                  </div>
              </div>
          </div>

          {/* Right Column: Detailed Report */}
          <div className="lg:w-2/3 flex flex-col bg-brand-dark/20 h-full">
            {/* Navigation Tabs */}
            <div className="flex border-b border-white/5 bg-brand-secondary/20 overflow-x-auto scrollbar-hide">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`flex-none px-6 py-3 lg:flex-1 lg:py-4 text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap ${activeTab === 'overview' ? 'text-brand-accent border-b-2 border-brand-accent bg-brand-accent/5' : 'text-brand-muted hover:text-white hover:bg-white/5'}`}
              >
                Tổng Quan
              </button>
              <button 
                onClick={() => setActiveTab('details')}
                className={`flex-none px-6 py-3 lg:flex-1 lg:py-4 text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap ${activeTab === 'details' ? 'text-brand-accent border-b-2 border-brand-accent bg-brand-accent/5' : 'text-brand-muted hover:text-white hover:bg-white/5'}`}
              >
                Chi Tiết Ứng Nghiệm
              </button>
              <button 
                onClick={() => setActiveTab('advice')}
                className={`flex-none px-6 py-3 lg:flex-1 lg:py-4 text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap ${activeTab === 'advice' ? 'text-brand-accent border-b-2 border-brand-accent bg-brand-accent/5' : 'text-brand-muted hover:text-white hover:bg-white/5'}`}
              >
                Lời Khuyên
              </button>
              <button 
                onClick={() => setActiveTab('chat')}
                className={`flex-none px-6 py-3 lg:flex-1 lg:py-4 text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap ${activeTab === 'chat' ? 'text-brand-accent border-b-2 border-brand-accent bg-brand-accent/5' : 'text-brand-muted hover:text-white hover:bg-white/5'}`}
              >
                <span className="flex items-center gap-2">
                  Hỏi Đại Sư AI <span className="bg-brand-accent text-brand-dark px-1.5 py-0.5 rounded-full text-[8px]">NEW</span>
                </span>
              </button>
            </div>

            {/* Report Content */}
            <div className="p-4 md:p-6 lg:p-8 flex-grow overflow-y-auto custom-scrollbar bg-brand-primary/30 h-[500px] lg:h-auto">
              
              {activeTab === 'overview' && (
                <div className="animate-fade-in pb-10">
                  {displayPoem ? (
                      <div className="space-y-6">
                          {fortune && (
                            <div className="text-center">
                                <span className="inline-block px-2 py-0.5 bg-brand-accent/20 text-brand-accent text-[10px] uppercase font-bold tracking-widest border border-brand-accent/30 rounded mb-2">{fortune.nature}</span>
                                <h3 className="text-xl font-bold text-white mb-4">{fortune.number} - {fortune.name}</h3>
                            </div>
                          )}

                          {/* Poem Card */}
                          <div className="bg-[#fff9e6]/5 border border-[#D4AF37]/30 p-5 rounded-xl relative overflow-hidden text-center">
                              <div className="absolute top-0 right-0 p-2 opacity-10">
                                  <ScrollText size={60} className="text-[#D4AF37]" />
                              </div>
                              <h4 className="text-[#D4AF37] font-serif font-bold uppercase tracking-wider text-sm mb-4 inline-block border-b border-[#D4AF37]/30 pb-1">Thánh Ý (Nội Dung Quẻ)</h4>
                              {fortune?.poem_han && <p className="text-brand-muted text-sm mb-2 font-serif">{fortune.poem_han}</p>}
                              <div className="font-serif text-brand-text/90 italic leading-loose whitespace-pre-line text-lg">
                                  {displayPoem}
                              </div>
                          </div>

                          {/* Legend Card */}
                          {fortune?.legend && (
                            <div className="bg-brand-secondary/40 border border-white/10 p-5 rounded-xl">
                              <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
                                  <BookOpen size={18} className="text-purple-400" />
                                  <h4 className="text-purple-100 font-bold uppercase tracking-wider text-sm">Điển Tích (Tích Xưa)</h4>
                              </div>
                              <div className="prose prose-invert prose-sm max-w-none text-brand-text/80 leading-relaxed italic">
                                  {fortune.legend}
                              </div>
                            </div>
                          )}

                          {/* Meaning Card */}
                          <div className="bg-brand-secondary/40 border border-white/10 p-5 rounded-xl">
                              <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
                                  <Lightbulb size={18} className="text-blue-400" />
                                  <h4 className="text-blue-100 font-bold uppercase tracking-wider text-sm">Giải Nghĩa Chi Tiết</h4>
                              </div>
                              <div className="prose prose-invert prose-sm max-w-none text-brand-text/80 leading-relaxed">
                                  <ReactMarkdown>{displayMeaning}</ReactMarkdown>
                              </div>
                          </div>
                      </div>
                  ) : (
                      <div className="prose prose-invert prose-p:text-brand-text prose-p:text-sm prose-p:leading-7 max-w-none">
                          <ReactMarkdown>{result.overview}</ReactMarkdown>
                      </div>
                  )}
                  
                  {/* CTA to Switch to Chat */}
                  <div onClick={() => setActiveTab('chat')} className="mt-8 bg-brand-accent/10 border border-brand-accent/20 p-4 rounded-lg flex items-center justify-between cursor-pointer active:scale-95 transition-transform">
                    <div>
                        <p className="text-brand-accent text-sm font-bold">Chưa rõ ý nghĩa?</p>
                        <p className="text-brand-muted text-xs">Trò chuyện trực tiếp với Đại sư AI để luận giải kỹ hơn.</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center text-brand-dark">
                        <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="grid grid-cols-1 gap-4 md:gap-6 animate-fade-in pb-10">
                  
                  {/* CAREER */}
                  {hasData(result.details.career) && (
                    <div className="bg-brand-secondary/30 p-4 md:p-6 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all duration-300">
                      <div className="flex items-center gap-4 mb-4 pb-3 border-b border-white/5">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-transparent flex items-center justify-center border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                          <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm md:text-base text-blue-100 uppercase tracking-wide">Công Danh & Sự Nghiệp</h4>
                          <div className="h-0.5 w-12 bg-blue-500/30 mt-1 rounded-full"></div>
                        </div>
                      </div>
                      {renderDetailContent(result.details.career)}
                    </div>
                  )}

                  {/* FINANCE */}
                  {hasData(result.details.finance) && (
                    <div className="bg-brand-secondary/30 p-4 md:p-6 rounded-xl border border-white/5 hover:border-yellow-500/30 transition-all duration-300">
                      <div className="flex items-center gap-4 mb-4 pb-3 border-b border-white/5">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-transparent flex items-center justify-center border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.15)]">
                          <Coins className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm md:text-base text-yellow-100 uppercase tracking-wide">Tài Lộc & Tài Chính</h4>
                          <div className="h-0.5 w-12 bg-yellow-500/30 mt-1 rounded-full"></div>
                        </div>
                      </div>
                      {renderDetailContent(result.details.finance)}
                    </div>
                  )}

                  {/* LOVE */}
                  {hasData(result.details.love) && (
                    <div className="bg-brand-secondary/30 p-4 md:p-6 rounded-xl border border-white/5 hover:border-pink-500/30 transition-all duration-300">
                      <div className="flex items-center gap-4 mb-4 pb-3 border-b border-white/5">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-transparent flex items-center justify-center border border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.15)]">
                          <Heart className="w-5 h-5 md:w-6 md:h-6 text-pink-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm md:text-base text-pink-100 uppercase tracking-wide">Tình Duyên & Gia Đạo</h4>
                          <div className="h-0.5 w-12 bg-pink-500/30 mt-1 rounded-full"></div>
                        </div>
                      </div>
                      {renderDetailContent(result.details.love)}
                    </div>
                  )}

                  {/* HEALTH */}
                  {hasData(result.details.health) && (
                    <div className="bg-brand-secondary/30 p-4 md:p-6 rounded-xl border border-white/5 hover:border-green-500/30 transition-all duration-300">
                      <div className="flex items-center gap-4 mb-4 pb-3 border-b border-white/5">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-transparent flex items-center justify-center border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.15)]">
                          <Activity className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm md:text-base text-green-100 uppercase tracking-wide">Sức Khỏe & Thể Chất</h4>
                          <div className="h-0.5 w-12 bg-green-500/30 mt-1 rounded-full"></div>
                        </div>
                      </div>
                      {renderDetailContent(result.details.health)}
                    </div>
                  )}

                  {/* Empty State if no details available */}
                  {!hasData(result.details.career) && !hasData(result.details.finance) && !hasData(result.details.love) && !hasData(result.details.health) && (
                       <div className="text-center p-8 text-brand-muted border border-white/5 rounded-xl border-dashed">
                           <p>Chưa có thông tin chi tiết cho sở cầu này. Vui lòng xem phần Tổng Quan hoặc hỏi thêm AI.</p>
                       </div>
                  )}
                </div>
              )}

              {activeTab === 'advice' && (
                <div className="animate-fade-in h-full pb-10">
                  <div className="bg-gradient-to-br from-brand-secondary/50 to-transparent p-4 md:p-6 rounded-lg border border-brand-accent/20 h-full">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="text-brand-accent w-5 h-5" />
                        <h3 className="text-lg font-serif text-white">Lời Khuyên Chiến Lược</h3>
                      </div>
                      <div className="prose prose-invert prose-p:text-brand-text prose-li:text-brand-text prose-sm max-w-none text-sm">
                        <ReactMarkdown>{result.advice}</ReactMarkdown>
                      </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'chat' && (
                <div className="animate-fade-in h-full">
                    <ChatConsultant predictionContext={result} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
