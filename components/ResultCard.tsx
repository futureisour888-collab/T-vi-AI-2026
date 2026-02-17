
import React, { useState } from 'react';
import { PredictionResult } from '../types';
import ReactMarkdown from 'react-markdown';
import { Compass, Heart, Briefcase, Coins, Activity, Sparkles, ScanLine, FileText, Download, ChevronRight, ScrollText, Lightbulb, UserCircle, Calendar, Target, Image as ImageIcon, BookOpen, AlertOctagon, Ban, CheckCircle2, AlertTriangle, Eye, Smile, Gem, Scissors, Glasses, Crown, Printer, ScanFace, Star, Hexagon, Component, Palette, Home, Baby, Plane, ShieldCheck, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ResultCardProps {
  result: PredictionResult;
  onReset: () => void;
  imageSrc?: string | null;
}

type TabType = 'overview' | 'details' | 'advice';

const ResultCard: React.FC<ResultCardProps> = ({ result, onReset, imageSrc }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isExporting, setIsExporting] = useState(false);

  // Improved Color Mapping for Vietnamese terms
  const getColorHex = (colorName: string): string => {
    const lower = colorName.toLowerCase().trim();
    if (lower.includes('đỏ') || lower.includes('huyết')) return '#DC2626';
    if (lower.includes('xanh lá') || lower.includes('lục')) return '#16A34A';
    if (lower.includes('xanh dương') || lower.includes('lam') || lower.includes('nước') || lower.includes('thủy')) return '#2563EB';
    if (lower.includes('vàng') || lower.includes('kim')) return '#CA8A04'; // Gold/Yellow
    if (lower.includes('trắng') || lower.includes('bạc')) return '#F8FAFC'; // White/Silver
    if (lower.includes('đen') || lower.includes('huyền')) return '#1e293b'; // Dark Slate
    if (lower.includes('tím')) return '#9333EA';
    if (lower.includes('hồng')) return '#DB2777';
    if (lower.includes('cam')) return '#EA580C';
    if (lower.includes('xám') || lower.includes('ghi')) return '#64748B';
    if (lower.includes('nâu') || lower.includes('đất') || lower.includes('thổ')) return '#78350F';
    if (lower.includes('be') || lower.includes('kem')) return '#F5F5DC';
    if (lower.includes('ngọc')) return '#10B981'; // Emerald
    return '#D4AF37'; // Default Gold for unknown
  };

  const getColors = (colorString: string | undefined): string[] => {
    if (!colorString) return [];
    // Split by common delimiters: comma, 'và', slash, semicolon
    return colorString.split(/,|và|với|\/|;/).map(s => s.trim()).filter(s => s.length > 0);
  };

  const captureAndDownloadPdf = async () => {
    const page1Id = 'print-page-1';
    const page2Id = 'print-page-2';
    const page3Id = 'print-page-3'; 
    
    const element1 = document.getElementById(page1Id);
    const element2 = document.getElementById(page2Id);
    const element3 = document.getElementById(page3Id);
    
    if (!element1 || !element2) return;

    setIsExporting(true);

    try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = 210;
        const pdfHeight = 297;

        // --- Helper to capture and add page ---
        const addPageToPdf = async (element: HTMLElement, isFirstPage: boolean = false) => {
             if (!isFirstPage) pdf.addPage();
             
             const clone = element.cloneNode(true) as HTMLElement;
             document.body.appendChild(clone);
             Object.assign(clone.style, {
                display: 'block', position: 'fixed', top: '-10000px', left: '0', zIndex: '-1000',
                width: '794px', height: '1123px' // Strict A4 pixel size at 96 DPI
             });
             
             // Wait for images to load in clone
             await new Promise(resolve => setTimeout(resolve, 300));

             const canvas = await html2canvas(clone, {
                scale: 2, useCORS: true, logging: false,
                width: 794, height: 1123, windowWidth: 794, windowHeight: 1123,
                backgroundColor: '#ffffff'
             });
             document.body.removeChild(clone);
             
             const imgData = canvas.toDataURL('image/png');
             pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        };

        // Process Pages
        await addPageToPdf(element1, true);
        await addPageToPdf(element2);
        
        // Only add Page 3 if it exists (Face Reading mode)
        if (element3 && result.faceAnalysis) {
            await addPageToPdf(element3);
        }

        // Save
        const fileName = result.userAttributes?.name 
          ? `HuyenBi-HoSo-${result.userAttributes.name.replace(/\s+/g, '-')}.pdf`
          : `HuyenBi-Report-${Date.now()}.pdf`;
        pdf.save(fileName);

    } catch (error) {
        console.error("Export failed", error);
        alert("Có lỗi khi xuất file PDF. Vui lòng thử lại.");
    } finally {
        setIsExporting(false);
    }
  };

  // Helper to split content into Pros and Cons - CLEANER FOR PRINT
  const renderDetailContent = (content: string, isPrintMode: boolean = false) => {
    if (!content) return null;

    // Explicitly remove bold markers if present
    const cleanContent = content.replace(/\*\*/g, '');

    let pros = cleanContent;
    let cons = '';

    if (cleanContent.includes('⚠️')) {
       const parts = cleanContent.split('⚠️');
       pros = parts[0].trim();
       cons = parts.slice(1).join(' ').trim();
       cons = cons.replace(/^(?:\*\*|)\s*(?:CẢNH BÁO|LƯU Ý|.*?CÁO)(?:\*\*|)(?::|)\s*/i, '');
    } else {
       const parts = cleanContent.split(/(?:\*\*|)\s*CẢNH BÁO(?:\*\*|):/i);
       if (parts.length > 1) {
          pros = parts[0].trim();
          cons = parts.slice(1).join(' ').trim();
       }
    }

    pros = pros.replace(/^(?:\*\*|)\s*✅\s*(?:ĐIỂM SÁNG|CƠ HỘI|ƯU ĐIỂM|.*?)(?:\*\*|)(?::|)\s*/i, '').trim();
    
    if (pros.startsWith(':')) pros = pros.substring(1).trim();
    if (cons.startsWith(':')) cons = cons.substring(1).trim();

    if (isPrintMode) {
        // --- PRINT MODE: Text Only, Clean ---
        return (
            <div className="mt-2 space-y-3">
                {pros && (
                    <div className="text-sm text-slate-700 text-justify">
                        <strong className="text-emerald-700 block mb-0.5 font-bold uppercase text-xs">● Cát Lợi:</strong>
                        <ReactMarkdown>{pros}</ReactMarkdown>
                    </div>
                )}
                {cons && (
                    <div className="text-sm text-slate-700 text-justify">
                        <strong className="text-red-700 block mb-0.5 font-bold uppercase text-xs">● Cảnh Báo:</strong>
                        <ReactMarkdown>{cons}</ReactMarkdown>
                    </div>
                )}
            </div>
        );
    }

    // --- SCREEN MODE: Colorful Cards ---
    const bgGreen = 'bg-green-500/10 border border-green-500/30';
    const bgRed = 'bg-red-500/10 border border-red-500/30';
    const titleGreen = 'text-green-600';
    const titleRed = 'text-red-600';

    return (
      <div className="space-y-4 mt-3">
         {pros && (
            <div className={`rounded-lg p-4 ${bgGreen}`}>
               <h5 className={`${titleGreen} font-bold text-sm uppercase mb-2 flex items-center gap-2 border-b border-green-200/50 pb-1`}>
                  <CheckCircle2 size={14} /> Điểm Sáng / Cát Lợi
               </h5>
               <div className={`text-sm leading-7 text-justify text-gray-300 [&>p]:mb-2 last:[&>p]:mb-0`}>
                  <ReactMarkdown>{pros}</ReactMarkdown>
               </div>
            </div>
         )}
         {cons && (
            <div className={`rounded-lg p-4 ${bgRed}`}>
               <h5 className={`${titleRed} font-bold text-sm uppercase mb-2 flex items-center gap-2 border-b border-red-200/50 pb-1`}>
                  <AlertTriangle size={14} /> Cảnh Báo / Hung Hiểm
               </h5>
               <div className={`text-sm leading-7 text-justify text-gray-300 [&>p]:mb-2 last:[&>p]:mb-0`}>
                  <ReactMarkdown>{cons}</ReactMarkdown>
               </div>
            </div>
         )}
      </div>
    );
  };

  const fortune = result.fortuneContent;
  const faceData = result.faceAnalysis; 
  const displayPoem = fortune?.poem_viet || (result.overview.includes('**💡 GIẢI NGHĨA:**') ? result.overview.split('**💡 GIẢI NGHĨA:**')[0].replace('**📜 NỘI DUNG QUẺ:**', '').trim() : '');
  const displayMeaning = fortune?.meaning_details || (result.overview.includes('**💡 GIẢI NGHĨA:**') ? result.overview.split('**💡 GIẢI NGHĨA:**')[1].trim() : result.overview);
  const hasData = (text: string) => text && text.trim().length > 5 && text !== 'null';

  const luckyColorsList = getColors(result.luckyColor);
  const unluckyColorsList = getColors(result.unluckyColor);
  const user = result.userAttributes;

  return (
    <div className="max-w-6xl mx-auto">
      
      {/* ================= PRINT TEMPLATE PAGE 1: INFO & OVERVIEW ================= */}
      <div id="print-page-1" className="hidden bg-white text-slate-900 font-sans relative w-[794px] h-[1123px] overflow-hidden">
         <div className="p-12 h-full flex flex-col relative">
             {/* Header */}
             <div className="flex justify-between items-end border-b-2 border-[#D4AF37] pb-4 mb-8">
                <div>
                   <h1 className="text-3xl font-serif font-bold text-[#D4AF37] uppercase tracking-widest">Huyền Bí AI</h1>
                   <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mt-1 font-medium">Báo Cáo Phong Thủy & Tử Vi 2026</p>
                </div>
                <div className="text-right">
                   <div className="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">Mã Hồ Sơ</div>
                   <div className="font-mono font-bold text-lg text-slate-800 tracking-wider">#{Math.floor(Math.random() * 100000)}</div>
                </div>
             </div>

             {/* 1. User Info Section (Grid Layout) */}
             <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-8">
                 <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                    <div className="border-b border-slate-200 pb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Họ và Tên</span>
                        <span className="text-2xl font-serif font-bold text-slate-900">{user?.name}</span>
                    </div>
                    <div className="border-b border-slate-200 pb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ngày Sinh</span>
                        <span className="text-2xl font-serif font-bold text-slate-900">{user?.birthDate} ({user?.gender === 'male' ? 'Nam' : 'Nữ'})</span>
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tuổi Âm Lịch</span>
                        <span className="text-base text-slate-700 font-medium">{user?.lunarDate}</span>
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ngày Luận Giải</span>
                        <span className="text-base text-slate-700 font-medium">{new Date().toLocaleDateString('vi-VN')}</span>
                    </div>
                 </div>
             </div>

             {/* 2. Face Analysis Summary (No Details here, just image and stats) */}
             {faceData ? (
                 <div className="flex-grow flex flex-col">
                     <h2 className="text-[#9D8031] font-serif font-bold text-xl uppercase mb-6 flex items-center gap-2 border-b border-[#D4AF37]/30 pb-2">
                         <ScanFace size={24} /> Hồ Sơ Nhân Tướng Học
                     </h2>

                     <div className="flex gap-8 mb-8">
                         {/* Left: Image Card */}
                         <div className="w-[45%] shrink-0">
                             {imageSrc && (
                                 <div className="w-full aspect-[3/4] rounded-sm overflow-hidden border-4 border-slate-100 shadow-sm relative">
                                     <img src={imageSrc} className="w-full h-full object-cover grayscale contrast-125" />
                                     <div className="absolute bottom-0 w-full bg-white/90 text-center text-[10px] font-bold py-1 border-t border-slate-200 tracking-wider text-slate-500">
                                         FACE ID VERIFIED
                                     </div>
                                 </div>
                             )}
                         </div>

                         {/* Right: Basic Stats */}
                         <div className="w-[55%] flex flex-col justify-center gap-6">
                             <div className="bg-[#FFFCF0] border border-[#E8DCC2] p-6 rounded text-center">
                                 <div className="text-xs uppercase text-[#9D8031] font-bold tracking-wider mb-2">Hình Tướng Khuôn Mặt</div>
                                 <div className="text-3xl font-serif font-bold text-slate-900">{faceData.faceShape}</div>
                             </div>
                             
                             <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#FFFCF0] border border-[#E8DCC2] p-4 rounded text-center">
                                    <div className="text-[10px] uppercase text-[#9D8031] font-bold tracking-wider mb-1">Ngũ Hành</div>
                                    <div className="text-lg font-bold text-slate-900">{faceData.element}</div>
                                </div>
                                <div className="bg-[#FFFCF0] border border-[#E8DCC2] p-4 rounded text-center">
                                    <div className="text-[10px] uppercase text-[#9D8031] font-bold tracking-wider mb-1">Phúc Tướng</div>
                                    <div className="text-lg font-bold text-slate-900">{faceData.harmonyScore}/100</div>
                                </div>
                             </div>
                             
                             {faceData.threeZones && (
                                 <div className="mt-4 bg-slate-50 border border-slate-200 p-3 rounded">
                                     <div className="text-xs font-bold text-[#9D8031] uppercase mb-1">Vận Khí Hoàng Kim</div>
                                     <div className="text-sm font-serif italic text-slate-800">{faceData.threeZones.goldenAge}</div>
                                 </div>
                             )}
                         </div>
                     </div>
                     
                     {/* 3. Overview (Moved to Page 1 to fill space) */}
                     <div className="mt-4 border-t border-slate-200 pt-6">
                         <h3 className="text-[#9D8031] font-bold text-sm uppercase mb-3 flex items-center gap-2">
                             <Star size={16} /> Tổng Quan Vận Hạn 2026
                         </h3>
                         <div className="text-slate-800 text-justify leading-relaxed text-sm columns-2 gap-8">
                            <ReactMarkdown>{result.overview}</ReactMarkdown>
                         </div>
                     </div>
                 </div>
             ) : (
                 // Fallback if no face data (Show Overview)
                 <div className="flex-grow">
                     <h2 className="text-[#9D8031] font-serif font-bold text-xl uppercase mb-6 flex items-center gap-2 border-b border-[#D4AF37]/30 pb-2">
                         <Star size={24} /> Tổng Quan Vận Hạn
                     </h2>
                     <div className="text-slate-800 text-justify leading-loose text-sm">
                        <ReactMarkdown>{result.overview}</ReactMarkdown>
                     </div>
                 </div>
             )}

             {/* Footer Page 1 */}
             <div className="mt-auto pt-6 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400">
                <span className="uppercase tracking-widest">Huyen Bi AI Technology</span>
                <span className="font-mono">Page 1/3</span>
             </div>
         </div>
      </div>

      {/* ================= PRINT TEMPLATE PAGE 2: DETAILS ================= */}
      <div id="print-page-2" className="hidden bg-white text-slate-900 font-sans relative w-[794px] h-[1123px] overflow-hidden">
         <div className="p-12 h-full flex flex-col relative">
            {/* Simple Header */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-8">
                <span className="text-xl font-serif font-bold text-[#D4AF37] uppercase">Chi Tiết Vận Hạn 2026</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Báo cáo nội bộ</span>
            </div>

            <div className="grid grid-cols-1 gap-8">
                 {/* Career */}
                 {hasData(result.details.career) && (
                    <div className="bg-slate-50 p-5 rounded border border-slate-100">
                        <h3 className="text-slate-900 font-bold uppercase text-sm mb-2 flex items-center gap-2">
                            <Briefcase size={16} className="text-blue-600"/> Công Danh & Sự Nghiệp
                        </h3>
                        {renderDetailContent(result.details.career, true)}
                    </div>
                 )}

                 {/* Finance */}
                 {hasData(result.details.finance) && (
                    <div className="bg-slate-50 p-5 rounded border border-slate-100">
                        <h3 className="text-slate-900 font-bold uppercase text-sm mb-2 flex items-center gap-2">
                            <Coins size={16} className="text-yellow-600"/> Tài Lộc & Tiền Bạc
                        </h3>
                        {renderDetailContent(result.details.finance, true)}
                    </div>
                 )}

                 {/* Love */}
                 {hasData(result.details.love) && (
                    <div className="bg-slate-50 p-5 rounded border border-slate-100">
                        <h3 className="text-slate-900 font-bold uppercase text-sm mb-2 flex items-center gap-2">
                            <Heart size={16} className="text-pink-600"/> Tình Duyên & Gia Đạo
                        </h3>
                        {renderDetailContent(result.details.love, true)}
                    </div>
                 )}

                 {/* Health */}
                 {hasData(result.details.health) && (
                    <div className="bg-slate-50 p-5 rounded border border-slate-100">
                        <h3 className="text-slate-900 font-bold uppercase text-sm mb-2 flex items-center gap-2">
                            <Activity size={16} className="text-green-600"/> Sức Khỏe & Thể Chất
                        </h3>
                        {renderDetailContent(result.details.health, true)}
                    </div>
                 )}
            </div>
            
            {/* Advice / Lucky Numbers at bottom - UPDATED with Swatches */}
            <div className="mt-auto mb-8 grid grid-cols-3 gap-4">
                {/* Lucky Number */}
                <div className="bg-[#FFFCF0] border border-[#E8DCC2] p-3 rounded text-center flex flex-col justify-center">
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1">Số May Mắn</span>
                    <span className="text-3xl font-bold text-slate-900 font-serif">{result.luckyNumber}</span>
                </div>

                {/* Lucky Color */}
                <div className="bg-[#FFFCF0] border border-[#E8DCC2] p-3 rounded text-center flex flex-col items-center justify-center">
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest block mb-2">Màu Hợp Mệnh</span>
                    <div className="flex -space-x-1.5 mb-2 justify-center">
                        {luckyColorsList.map((c, i) => (
                           <div 
                              key={i}
                              className="w-6 h-6 rounded-full border border-slate-300 shadow-sm"
                              style={{ backgroundColor: getColorHex(c) }}
                           ></div>
                        ))}
                    </div>
                    <span className="text-sm font-bold text-slate-900 font-serif leading-tight px-1">{result.luckyColor}</span>
                </div>

                {/* Unlucky Color */}
                <div className="bg-slate-50 border border-slate-200 p-3 rounded text-center flex flex-col items-center justify-center">
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest block mb-2">Màu Kỵ (Tránh)</span>
                    <div className="flex -space-x-1.5 mb-2 justify-center">
                        {unluckyColorsList.map((c, i) => (
                           <div 
                              key={i}
                              className="w-6 h-6 rounded-full border border-slate-300 relative overflow-hidden"
                              style={{ backgroundColor: getColorHex(c) }}
                           >
                              {/* Muted overlay for PDF print */}
                              <div className="absolute inset-0 bg-white/50"></div>
                              <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-sans text-[10px] font-bold">×</div>
                           </div>
                        ))}
                    </div>
                    <span className="text-sm font-bold text-slate-500 font-serif leading-tight px-1">{result.unluckyColor || 'Không có'}</span>
                </div>
            </div>

            {/* Footer Page 2 */}
            <div className="mt-auto pt-6 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400">
                <span className="italic">Kết quả chỉ mang tính tham khảo. Chúc quý gia chủ vạn sự như ý.</span>
                <span className="font-mono">Page 2/3</span>
            </div>
         </div>
      </div>

      {/* ================= PRINT TEMPLATE PAGE 3: FACE DETAILS & SOLUTIONS ================= */}
      {faceData && (
          <div id="print-page-3" className="hidden bg-white text-slate-900 font-sans relative w-[794px] h-[1123px] overflow-hidden">
             <div className="p-12 h-full flex flex-col relative">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-8">
                    <span className="text-xl font-serif font-bold text-[#D4AF37] uppercase">Luận Giải Chi Tiết & Cải Vận</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Báo cáo nội bộ</span>
                </div>

                <div className="flex-grow space-y-8">
                     {/* 1. Detailed Features Analysis */}
                     <div>
                         <h2 className="text-[#9D8031] font-bold text-lg uppercase mb-4 flex items-center gap-2">
                             <ScanFace size={20} /> Phân Tích Ngũ Quan (Tướng Số)
                         </h2>
                         <div className="grid grid-cols-1 gap-5">
                             <div className="bg-slate-50 p-4 rounded border border-slate-100">
                                 <h4 className="text-[#9D8031] font-bold text-xs uppercase mb-1">Mắt (Thần Thái - Cung Điền Trạch)</h4>
                                 <p className="text-sm text-slate-700 text-justify leading-relaxed">{faceData.features.eyes}</p>
                             </div>
                             <div className="bg-slate-50 p-4 rounded border border-slate-100">
                                 <h4 className="text-[#9D8031] font-bold text-xs uppercase mb-1">Mũi (Tài Bạch - Kho Tiền)</h4>
                                 <p className="text-sm text-slate-700 text-justify leading-relaxed">{faceData.features.nose}</p>
                             </div>
                             <div className="bg-slate-50 p-4 rounded border border-slate-100">
                                 <h4 className="text-[#9D8031] font-bold text-xs uppercase mb-1">Miệng (Xuất Nạp - Cung Phúc Đức)</h4>
                                 <p className="text-sm text-slate-700 text-justify leading-relaxed">{faceData.features.mouth}</p>
                             </div>
                             <div className="bg-slate-50 p-4 rounded border border-slate-100">
                                 <h4 className="text-[#9D8031] font-bold text-xs uppercase mb-1">Lông Mày (Bảo Thọ - Cung Huynh Đệ)</h4>
                                 <p className="text-sm text-slate-700 text-justify leading-relaxed">{faceData.features.brows}</p>
                             </div>
                         </div>
                     </div>

                     {/* 2. Solutions Box */}
                     <div className="bg-[#FFFCF0] border border-[#E8DCC2] p-6 rounded-lg">
                         <div className="flex items-center gap-2 mb-4 border-b border-[#E8DCC2] pb-2">
                             <Sparkles size={20} className="text-[#D4AF37]" />
                             <h2 className="text-[#9D8031] font-bold text-lg uppercase">Giải Pháp Cải Vận (Phong Thủy & Thẩm Mỹ)</h2>
                         </div>
                         
                         <div className="space-y-5">
                             <div className="flex gap-4 items-start">
                                 <div className="w-8 h-8 rounded-full bg-white border border-[#E8DCC2] flex items-center justify-center shrink-0 mt-1">
                                     <Scissors size={14} className="text-purple-600"/>
                                 </div>
                                 <div>
                                     <h4 className="text-sm font-bold text-purple-900 mb-1">Kiểu Tóc Hợp Mệnh</h4>
                                     <p className="text-sm text-slate-700 leading-relaxed text-justify">{faceData.solutions.hairStyle}</p>
                                 </div>
                             </div>

                             <div className="flex gap-4 items-start">
                                 <div className="w-8 h-8 rounded-full bg-white border border-[#E8DCC2] flex items-center justify-center shrink-0 mt-1">
                                     <Glasses size={14} className="text-blue-600"/>
                                 </div>
                                 <div>
                                     <h4 className="text-sm font-bold text-blue-200 mb-1">Phụ Kiện & Trang Phục</h4>
                                     <p className="text-sm text-slate-700 leading-relaxed text-justify">{faceData.solutions.accessories}</p>
                                 </div>
                             </div>

                             <div className="flex gap-4 items-start">
                                 <div className="w-8 h-8 rounded-full bg-white border border-[#E8DCC2] flex items-center justify-center shrink-0 mt-1">
                                     <Smile size={14} className="text-pink-600"/>
                                 </div>
                                 <div>
                                     <h4 className="text-sm font-bold text-pink-900 mb-1">Thẩm Mỹ & Makeup</h4>
                                     <p className="text-sm text-slate-700 leading-relaxed text-justify">{faceData.solutions.makeup}</p>
                                 </div>
                             </div>

                             <div className="flex gap-4 items-start">
                                 <div className="w-8 h-8 rounded-full bg-white border border-[#E8DCC2] flex items-center justify-center shrink-0 mt-1">
                                     <Gem size={14} className="text-yellow-600"/>
                                 </div>
                                 <div className="flex-grow">
                                     <h4 className="text-sm font-bold text-yellow-900 mb-1">Vật Phẩm Phong Thủy: {faceData.solutions.fengShuiItem.itemName}</h4>
                                     
                                     {/* Tags for Material and Color */}
                                     <div className="flex gap-2 my-2">
                                         <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-200 uppercase">
                                             <Component size={10} /> {faceData.solutions.fengShuiItem.material}
                                         </span>
                                         <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                                             <Palette size={10} /> {faceData.solutions.fengShuiItem.color}
                                         </span>
                                     </div>

                                     <p className="text-sm text-slate-700 leading-relaxed text-justify italic font-medium">
                                        "{faceData.solutions.fengShuiItem.meaning}"
                                     </p>
                                 </div>
                             </div>
                         </div>
                     </div>
                </div>

                {/* Footer Page 3 */}
                <div className="mt-auto pt-6 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400">
                    <span className="uppercase tracking-widest">Huyen Bi AI Technology</span>
                    <span className="font-mono">Page 3/3</span>
                </div>
             </div>
          </div>
      )}
      
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
            <button 
                onClick={captureAndDownloadPdf}
                disabled={isExporting}
                className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-secondary hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all disabled:opacity-50"
            >
                {isExporting ? <span className="animate-spin">⏳</span> : <Download size={14} />}
                {isExporting ? 'Đang Xuất...' : `Lưu PDF (${result.faceAnalysis ? '3' : '2'} Trang)`}
            </button>
            <button onClick={onReset} className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 rounded-lg btn-gold text-xs font-bold shadow-glow touch-manipulation text-brand-dark">
                <Sparkles size={14} /> Tra Cứu Mới
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-grow min-h-[600px]">
          
          {/* Left Column */}
          <div className="lg:w-1/3 bg-brand-dark/30 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col">
            
            {/* Image Section */}
            {imageSrc ? (
                  <div className="relative w-full aspect-square lg:aspect-auto lg:h-[300px] overflow-hidden group border-b border-white/5 bg-black">
                  <img src={imageSrc} alt="Analyzed" className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700" />
                  
                  {/* Overlay Data for Face Analysis */}
                  {faceData && (
                     <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Face ID: Detected</span>
                        </div>
                        <p className="text-white font-bold text-lg leading-none">{faceData.faceShape}</p>
                        <p className="text-xs text-brand-muted mt-1">Ngũ hành: {faceData.element} • Phúc tướng: {faceData.harmonyScore}/100</p>
                     </div>
                  )}

                  <div className="absolute inset-0 z-10 pointer-events-none hidden lg:block">
                      <div className="w-full h-full bg-grid-pattern opacity-10"></div>
                  </div>
                  </div>
              ) : (
                  <div className="w-full h-[150px] bg-brand-dark/50 flex flex-col items-center justify-center border-b border-white/5 p-2 text-center">
                      <Compass className="w-8 h-8 lg:w-12 lg:h-12 text-brand-accent mb-2 opacity-50" />
                      <p className="text-[10px] lg:text-sm text-brand-muted">Phân tích Thiên Can - Địa Chi</p>
                  </div>
              )}

              {/* Stats Grid - UPDATED with Visual Swatches for Lucky/Unlucky */}
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
                      <span className="text-sm font-bold text-brand-text truncate mt-1 max-w-full px-1">{result.luckyColor}</span>
                  </div>

                  {/* Unlucky Color (Added Visual Swatches with Muted/Greyed Effect) */}
                  {result.unluckyColor ? (
                      <div className="bg-brand-secondary/40 p-3 rounded-lg border border-white/5 text-center flex flex-col items-center">
                          <span className="block text-[10px] text-brand-muted uppercase mb-2 flex items-center gap-1"><Ban size={10} /> Màu Kỵ</span>
                          <div className="flex -space-x-2">
                             {unluckyColorsList.map((c, i) => (
                               <div 
                                  key={i}
                                  className="w-6 h-6 rounded-full border border-white/20 shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 relative overflow-hidden"
                                  style={{ backgroundColor: getColorHex(c) }}
                                  title={`Tránh màu: ${c}`}
                               >
                                  {/* Muted Overlay for "Unlucky" effect */}
                                  <div className="absolute inset-0 bg-black/40 backdrop-grayscale-[50%]"></div>
                                  <div className="absolute inset-0 flex items-center justify-center text-white/70 font-bold text-[8px]">×</div>
                               </div>
                             ))}
                          </div>
                          <span className="text-sm font-bold text-brand-text truncate mt-1 max-w-full px-1">{result.unluckyColor}</span>
                      </div>
                  ) : (
                      <div className="bg-brand-secondary/40 p-3 rounded-lg border border-white/5 text-center flex flex-col items-center justify-center opacity-50">
                           <span className="text-[10px] text-brand-muted">---</span>
                      </div>
                  )}

                  {/* Lucky Number (Moved to bottom full width) */}
                  <div className="col-span-2 bg-brand-secondary/40 p-3 rounded-lg border border-white/5 text-center flex flex-col items-center justify-center">
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
              {faceData && (
                 <button 
                 onClick={() => setActiveTab('advice')}
                 className={`flex-none px-6 py-3 lg:flex-1 lg:py-4 text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap ${activeTab === 'advice' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5' : 'text-brand-muted hover:text-white hover:bg-white/5'}`}
                 >
                   ✨ Gợi Ý Cải Vận
                 </button>
              )}
              {!faceData && (
                <button 
                    onClick={() => setActiveTab('advice')}
                    className={`flex-none px-6 py-3 lg:flex-1 lg:py-4 text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap ${activeTab === 'advice' ? 'text-brand-accent border-b-2 border-brand-accent bg-brand-accent/5' : 'text-brand-muted hover:text-white hover:bg-white/5'}`}
                >
                    Lời Khuyên
                </button>
              )}
            </div>

            {/* Report Content */}
            <div className="p-4 md:p-6 lg:p-8 flex-grow overflow-y-auto custom-scrollbar bg-brand-primary/30 h-[500px] lg:h-auto">
              
              {activeTab === 'overview' && (
                <div className="animate-fade-in pb-10">
                   {faceData ? (
                       // --- COMMERCIAL FACE READING OVERVIEW ---
                       <div className="space-y-6">
                           
                           {/* NEW: Tam Dinh (3 Zones) Visualization */}
                           {faceData.threeZones && (
                               <div className="bg-gradient-to-r from-brand-secondary/80 to-brand-primary/80 border border-brand-accent/30 rounded-xl p-5 shadow-lg relative overflow-hidden">
                                   <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                                       <ScanFace size={100} />
                                   </div>
                                   <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
                                       <Target className="text-brand-accent" size={20}/>
                                       <h3 className="text-white font-bold uppercase text-sm tracking-wider">Phân Tích Tam Đình (Vận Mệnh Theo Độ Tuổi)</h3>
                                   </div>
                                   
                                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                       {/* Upper Zone */}
                                       <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                           <div className="text-[10px] text-brand-muted uppercase tracking-wider mb-1">Tiền Vận (Trán)</div>
                                           <div className="text-xs text-white text-justify leading-relaxed">{faceData.threeZones.upper}</div>
                                       </div>
                                       {/* Middle Zone */}
                                       <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                           <div className="text-[10px] text-brand-muted uppercase tracking-wider mb-1">Trung Vận (Mũi/Má)</div>
                                           <div className="text-xs text-white text-justify leading-relaxed">{faceData.threeZones.middle}</div>
                                       </div>
                                       {/* Lower Zone */}
                                       <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                           <div className="text-[10px] text-brand-muted uppercase tracking-wider mb-1">Hậu Vận (Cằm)</div>
                                           <div className="text-xs text-white text-justify leading-relaxed">{faceData.threeZones.lower}</div>
                                       </div>
                                   </div>

                                   <div className="bg-brand-accent/10 border border-brand-accent/20 rounded-lg p-3 flex items-center justify-between">
                                       <span className="text-xs text-brand-accent font-bold uppercase">Thời Kỳ Hoàng Kim:</span>
                                       <span className="text-sm font-serif font-bold text-white">{faceData.threeZones.goldenAge}</span>
                                   </div>
                               </div>
                           )}

                           {/* 4 Pillars of Face */}
                           <div className="grid grid-cols-2 gap-4">
                               <div className="bg-brand-secondary/30 p-3 rounded-lg border border-white/5">
                                   <div className="flex items-center gap-2 mb-2">
                                       <Eye size={16} className="text-cyan-400"/>
                                       <h4 className="text-xs font-bold text-white uppercase">Thần Thái (Mắt)</h4>
                                   </div>
                                   <p className="text-xs text-brand-muted leading-relaxed text-justify">{faceData.features.eyes}</p>
                               </div>
                               <div className="bg-brand-secondary/30 p-3 rounded-lg border border-white/5">
                                   <div className="flex items-center gap-2 mb-2">
                                       <Activity size={16} className="text-yellow-400"/>
                                       <h4 className="text-xs font-bold text-white uppercase">Tài Bạch (Mũi)</h4>
                                   </div>
                                   <p className="text-xs text-brand-muted leading-relaxed text-justify">{faceData.features.nose}</p>
                               </div>
                               <div className="bg-brand-secondary/30 p-3 rounded-lg border border-white/5">
                                   <div className="flex items-center gap-2 mb-2">
                                       <Smile size={16} className="text-pink-400"/>
                                       <h4 className="text-xs font-bold text-white uppercase">Xuất Nạp (Miệng)</h4>
                                   </div>
                                   <p className="text-xs text-brand-muted leading-relaxed text-justify">{faceData.features.mouth}</p>
                               </div>
                               <div className="bg-brand-secondary/30 p-3 rounded-lg border border-white/5">
                                   <div className="flex items-center gap-2 mb-2">
                                       <Crown size={16} className="text-purple-400"/>
                                       <h4 className="text-xs font-bold text-white uppercase">Bảo Thọ (Cung Mày)</h4>
                                   </div>
                                   <p className="text-xs text-brand-muted leading-relaxed text-justify">{faceData.features.brows}</p>
                               </div>
                           </div>

                           {/* Premium 12 Palaces Teaser - UPDATED to Grid Layout for 8 Palaces */}
                           <div className="bg-gradient-to-b from-brand-secondary/50 to-brand-dark/50 p-5 rounded-xl border border-brand-accent/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                    <Sparkles size={80} className="text-brand-accent" />
                                </div>
                                <h3 className="text-brand-accent font-bold uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                                    <Crown size={16} /> Luận Giải 12 Cung Tướng Mệnh (Chi Tiết)
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                    {/* Column 1: Core */}
                                    <div className="space-y-3">
                                        <div className="flex flex-col gap-1 border-b border-white/5 pb-2">
                                            <span className="text-yellow-200 font-bold text-xs flex items-center gap-1"><Coins size={12}/> Tài Bạch (Tiền):</span>
                                            <span className="text-brand-muted text-xs text-justify leading-relaxed">{faceData.palaces.wealth}</span>
                                        </div>
                                        <div className="flex flex-col gap-1 border-b border-white/5 pb-2">
                                            <span className="text-blue-200 font-bold text-xs flex items-center gap-1"><Briefcase size={12}/> Quan Lộc (Sự nghiệp):</span>
                                            <span className="text-brand-muted text-xs text-justify leading-relaxed">{faceData.palaces.career}</span>
                                        </div>
                                        <div className="flex flex-col gap-1 border-b border-white/5 pb-2">
                                            <span className="text-pink-200 font-bold text-xs flex items-center gap-1"><Heart size={12}/> Phu Thê (Hôn nhân):</span>
                                            <span className="text-brand-muted text-xs text-justify leading-relaxed">{faceData.palaces.marriage}</span>
                                        </div>
                                        {faceData.palaces.property && (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-emerald-200 font-bold text-xs flex items-center gap-1"><Home size={12}/> Điền Trạch (Nhà đất):</span>
                                                <span className="text-brand-muted text-xs text-justify leading-relaxed">{faceData.palaces.property}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Column 2: Expanded */}
                                    <div className="space-y-3">
                                        {faceData.palaces.children && (
                                            <div className="flex flex-col gap-1 border-b border-white/5 pb-2">
                                                <span className="text-orange-200 font-bold text-xs flex items-center gap-1"><Baby size={12}/> Tử Tức (Con cái):</span>
                                                <span className="text-brand-muted text-xs text-justify leading-relaxed">{faceData.palaces.children}</span>
                                            </div>
                                        )}
                                        {faceData.palaces.migration && (
                                            <div className="flex flex-col gap-1 border-b border-white/5 pb-2">
                                                <span className="text-cyan-200 font-bold text-xs flex items-center gap-1"><Plane size={12}/> Thiên Di (Xuất ngoại):</span>
                                                <span className="text-brand-muted text-xs text-justify leading-relaxed">{faceData.palaces.migration}</span>
                                            </div>
                                        )}
                                        {faceData.palaces.health && (
                                            <div className="flex flex-col gap-1 border-b border-white/5 pb-2">
                                                <span className="text-red-200 font-bold text-xs flex items-center gap-1"><Activity size={12}/> Tật Ách (Sức khỏe):</span>
                                                <span className="text-brand-muted text-xs text-justify leading-relaxed">{faceData.palaces.health}</span>
                                            </div>
                                        )}
                                        <div className="flex flex-col gap-1">
                                            <span className="text-purple-200 font-bold text-xs flex items-center gap-1"><UserCircle size={12}/> Phụ Mẫu (Cha mẹ):</span>
                                            <span className="text-brand-muted text-xs text-justify leading-relaxed">{faceData.palaces.parents}</span>
                                        </div>
                                    </div>
                                </div>
                           </div>
                       </div>
                   ) : (
                       // Standard Overview
                       displayPoem ? (
                        <div className="space-y-6">
                            {/* ... (Keep existing Poem UI) ... */}
                            <div className="bg-[#fff9e6]/5 border border-[#D4AF37]/30 p-5 rounded-xl text-center">
                                <h4 className="text-[#D4AF37] font-bold text-sm mb-4">Thánh Ý</h4>
                                <div className="font-serif text-brand-text/90 italic leading-loose whitespace-pre-line text-lg">
                                    {displayPoem}
                                </div>
                            </div>
                            <div className="prose prose-invert prose-sm max-w-none text-brand-text/80 leading-relaxed">
                                <ReactMarkdown>{displayMeaning}</ReactMarkdown>
                            </div>
                        </div>
                       ) : (
                        <div className="prose prose-invert prose-p:text-brand-text prose-p:text-sm prose-p:leading-7 max-w-none">
                            <ReactMarkdown>{result.overview}</ReactMarkdown>
                        </div>
                       )
                   )}
                </div>
              )}

              {activeTab === 'details' && (
                <div className="grid grid-cols-1 gap-4 md:gap-6 animate-fade-in pb-10">
                  {/* CAREER */}
                  {hasData(result.details.career) && (
                    <div className="bg-brand-secondary/30 p-4 md:p-6 rounded-xl border border-white/5">
                      <div className="flex items-center gap-4 mb-4 pb-3 border-b border-white/5">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                            <Briefcase className="w-5 h-5 text-blue-400" />
                          </div>
                          <h4 className="font-bold text-blue-100 uppercase tracking-wide">Công Danh & Sự Nghiệp</h4>
                      </div>
                      {renderDetailContent(result.details.career)}
                    </div>
                  )}
                  {/* FINANCE */}
                  {hasData(result.details.finance) && (
                    <div className="bg-brand-secondary/30 p-4 md:p-6 rounded-xl border border-white/5">
                      <div className="flex items-center gap-4 mb-4 pb-3 border-b border-white/5">
                          <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]">
                            <Coins className="w-5 h-5 text-yellow-400" />
                          </div>
                          <h4 className="font-bold text-yellow-100 uppercase tracking-wide">Tài Lộc & Tài Chính</h4>
                      </div>
                      {renderDetailContent(result.details.finance)}
                    </div>
                  )}
                  {/* LOVE */}
                  {hasData(result.details.love) && (
                    <div className="bg-brand-secondary/30 p-4 md:p-6 rounded-xl border border-white/5">
                      <div className="flex items-center gap-4 mb-4 pb-3 border-b border-white/5">
                          <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center border border-pink-500/20 shadow-[0_0_10px_rgba(236,72,153,0.1)]">
                            <Heart className="w-5 h-5 text-pink-400" />
                          </div>
                          <h4 className="font-bold text-pink-100 uppercase tracking-wide">Tình Duyên & Gia Đạo</h4>
                      </div>
                      {renderDetailContent(result.details.love)}
                    </div>
                  )}
                  {/* HEALTH */}
                  {hasData(result.details.health) && (
                    <div className="bg-brand-secondary/30 p-4 md:p-6 rounded-xl border border-white/5">
                      <div className="flex items-center gap-4 mb-4 pb-3 border-b border-white/5">
                          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                            <Activity className="w-5 h-5 text-green-400" />
                          </div>
                          <h4 className="font-bold text-green-100 uppercase tracking-wide">Sức Khỏe & Thể Chất</h4>
                      </div>
                      {renderDetailContent(result.details.health)}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'advice' && (
                <div className="animate-fade-in h-full pb-10">
                  {faceData ? (
                      // --- PREMIUM FACE READING SOLUTIONS ---
                      <div className="space-y-4">
                          <div className="bg-gradient-to-br from-brand-secondary/80 to-brand-primary p-1 rounded-xl border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                              <div className="bg-black/40 rounded-lg p-5">
                                  <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                                      <Sparkles className="text-cyan-400 w-5 h-5" />
                                      <h3 className="text-lg font-bold text-white uppercase tracking-wider">Giải Pháp Cải Vận (Styling)</h3>
                                  </div>
                                  
                                  <div className="space-y-6">
                                      {/* Hair */}
                                      <div className="flex gap-4 items-start">
                                          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-1">
                                              <Scissors size={14} className="text-purple-400"/>
                                          </div>
                                          <div>
                                              <h4 className="text-sm font-bold text-purple-200 mb-1">Kiểu Tóc Hợp Mệnh</h4>
                                              <p className="text-sm text-brand-muted leading-relaxed text-justify">{faceData.solutions.hairStyle}</p>
                                          </div>
                                      </div>

                                      {/* Accessories */}
                                      <div className="flex gap-4 items-start">
                                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-1">
                                              <Glasses size={14} className="text-blue-400"/>
                                          </div>
                                          <div>
                                              <h4 className="text-sm font-bold text-blue-200 mb-1">Kính & Phụ Kiện</h4>
                                              <p className="text-sm text-brand-muted leading-relaxed text-justify">{faceData.solutions.accessories}</p>
                                          </div>
                                      </div>

                                      {/* Makeup */}
                                      <div className="flex gap-4 items-start">
                                          <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center shrink-0 mt-1">
                                              <Smile size={14} className="text-pink-400"/>
                                          </div>
                                          <div>
                                              <h4 className="text-sm font-bold text-pink-200 mb-1">Thẩm Mỹ & Makeup</h4>
                                              <p className="text-sm text-brand-muted leading-relaxed text-justify">{faceData.solutions.makeup}</p>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div className="bg-gradient-to-br from-yellow-900/20 to-brand-primary p-5 rounded-xl border border-yellow-500/20">
                               <div className="flex items-center gap-2 mb-4">
                                  <Gem className="text-yellow-400 w-5 h-5" />
                                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">Vật Phẩm Phong Thủy</h3>
                               </div>
                               <div className="bg-black/20 rounded-lg p-4 border border-yellow-500/10">
                                   <div className="flex justify-between items-start mb-2">
                                       <h4 className="text-yellow-200 font-bold text-base">{faceData.solutions.fengShuiItem.itemName}</h4>
                                   </div>
                                   <div className="flex flex-wrap gap-2 mb-3">
                                       <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-200 border border-yellow-500/30 uppercase tracking-wide">
                                           <Component size={10} /> {faceData.solutions.fengShuiItem.material}
                                       </span>
                                       <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
                                           <Palette size={10} /> {faceData.solutions.fengShuiItem.color}
                                       </span>
                                   </div>
                                   <p className="text-sm text-yellow-100/80 leading-relaxed text-justify italic">
                                      "{faceData.solutions.fengShuiItem.meaning}"
                                   </p>
                               </div>
                          </div>
                      </div>
                  ) : (
                      // Standard Advice
                      <div className="bg-gradient-to-br from-brand-secondary/50 to-transparent p-4 md:p-6 rounded-lg border border-brand-accent/20 h-full">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="text-brand-accent w-5 h-5" />
                            <h3 className="text-lg font-serif text-white">Lời Khuyên Chiến Lược</h3>
                        </div>
                        <div className="prose prose-invert prose-p:text-brand-text prose-li:text-brand-text prose-sm max-w-none text-sm">
                            <ReactMarkdown>{result.advice}</ReactMarkdown>
                        </div>
                      </div>
                  )}
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
