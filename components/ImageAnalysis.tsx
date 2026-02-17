
import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, Scan, Info, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { ImageAnalysisPayload, UserProfile } from '../types';

interface ImageAnalysisProps {
  type: 'PALM' | 'FACE' | 'FORTUNE_PAPER';
  userProfile: UserProfile;
  onAnalyze: (payload: ImageAnalysisPayload) => void;
  isLoading: boolean;
}

const WISH_LIST = [
  "Gia Đạo & Bình An",
  "Tài Lộc & Kinh Doanh",
  "Công Danh & Sự Nghiệp",
  "Tình Duyên & Hôn Nhân",
  "Thi Cử & Học Hành",
  "Bệnh Tật & Sức Khỏe",
  "Xuất Hành & Đi Xa",
  "Thất Vật & Kiện Tụng"
];

const ImageAnalysis: React.FC<ImageAnalysisProps> = ({ type, userProfile, onAnalyze, isLoading }) => {
  const [leftHand, setLeftHand] = useState<File | null>(null);
  const [rightHand, setRightHand] = useState<File | null>(null);
  const [dominantHand, setDominantHand] = useState<'left' | 'right'>('right');
  const [faceImage, setFaceImage] = useState<File | null>(null);
  const [paperImage, setPaperImage] = useState<File | null>(null);
  const [selectedWishes, setSelectedWishes] = useState<string[]>([]);
  const [isWishListExpanded, setIsWishListExpanded] = useState(false);
  
  const leftInputRef = useRef<HTMLInputElement>(null);
  const rightInputRef = useRef<HTMLInputElement>(null);
  const faceInputRef = useRef<HTMLInputElement>(null);
  const paperInputRef = useRef<HTMLInputElement>(null);

  const handleLeftHandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setLeftHand(e.target.files[0]);
  };
  const handleRightHandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setRightHand(e.target.files[0]);
  };
  const handleFaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFaceImage(e.target.files[0]);
  };
  const handlePaperChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setPaperImage(e.target.files[0]);
  };

  const toggleWish = (wish: string) => {
    setSelectedWishes(prev => 
      prev.includes(wish) ? prev.filter(w => w !== wish) : [...prev, wish]
    );
  };

  const handleSubmit = () => {
    if (type === 'PALM') {
      if (leftHand && rightHand) {
        onAnalyze({ files: [leftHand, rightHand], userProfile, dominantHand });
      }
    } else if (type === 'FORTUNE_PAPER') {
      if (paperImage) {
        onAnalyze({ files: [paperImage], userProfile, wishes: selectedWishes });
      }
    } else {
      // FACE
      if (faceImage) {
        onAnalyze({ files: [faceImage], userProfile });
      }
    }
  };

  const renderUploadBox = (
    file: File | null, 
    setFile: (f: File | null) => void, 
    inputRef: React.RefObject<HTMLInputElement | null>,
    label: string,
    instruction: string
  ) => {
    return (
      <div className="flex-1 w-full">
        <div className="flex items-center justify-between mb-2">
           <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">{label}</label>
           {file && <span className="text-xs text-brand-accent flex items-center gap-1"><Scan size={12}/> Ready</span>}
        </div>
        
        {!file ? (
          <div
            onClick={() => inputRef.current?.click()}
            className="w-full aspect-[4/3] md:aspect-[4/5] bg-brand-dark/30 border border-dashed border-brand-muted/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-brand-secondary/30 hover:border-brand-accent/50 transition-all group relative overflow-hidden active:bg-brand-secondary/40"
          >
            <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-brand-secondary/50 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-white/5">
              <Camera className="w-5 h-5 md:w-6 md:h-6 text-brand-muted group-hover:text-brand-accent transition-colors" />
            </div>
            <p className="text-xs text-brand-muted px-4 text-center font-medium leading-relaxed max-w-[90%]">{instruction}</p>
          </div>
        ) : (
          <div className="relative w-full aspect-[4/3] md:aspect-[4/5] rounded-lg overflow-hidden border border-brand-accent/30 bg-black group shadow-lg">
            <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover opacity-90" />
            
            {/* Tech Overlay */}
            <div className="absolute inset-0 border-[3px] border-transparent group-hover:border-brand-accent/20 transition-all pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 right-0 bg-brand-dark/80 p-2 text-xs text-center text-white backdrop-blur-sm border-t border-white/10">
              Đã tải lên
            </div>
            
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); if(inputRef.current) inputRef.current.value = ''; }}
              className="absolute top-2 right-2 p-2 bg-brand-dark/60 backdrop-blur-md rounded-full text-white hover:bg-red-500/80 transition-colors border border-white/10 shadow-md touch-manipulation"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    setLeftHand(null);
    setRightHand(null);
    setFaceImage(null);
    setPaperImage(null);
    setIsWishListExpanded(false);
    setSelectedWishes([]);
  }, [type]);

  const isFormValid = () => {
    let isFilesValid = false;
    
    if (type === 'PALM') isFilesValid = !!(leftHand && rightHand);
    else if (type === 'FORTUNE_PAPER') isFilesValid = !!paperImage;
    else isFilesValid = !!faceImage;

    return isFilesValid;
  };

  return (
    <div className="max-w-4xl mx-auto glass-card p-4 md:p-8 rounded-2xl animate-fade-in-up flex flex-col md:flex-row gap-6 md:gap-8">
      
      {/* Sidebar / Settings - Stacked on Mobile */}
      <div className="md:w-1/3 space-y-5 md:border-r border-white/5 md:pr-6">
         <div className="text-center md:text-left">
            <h3 className="text-lg md:text-xl font-serif text-white mb-2">Hồ Sơ Phân Tích</h3>
            <div className="bg-brand-secondary/40 p-3 rounded-lg border border-white/5 mb-2">
                <p className="text-white font-bold text-sm">{userProfile.name}</p>
                <p className="text-brand-muted text-xs">
                    {userProfile.birthDay}/{userProfile.birthMonth}/{userProfile.birthYear} - {userProfile.gender === 'male' ? 'Nam' : 'Nữ'}
                </p>
            </div>
            <p className="text-brand-muted text-xs leading-relaxed">
              {type === 'FORTUNE_PAPER' 
                ? 'Đọc và giải nghĩa Thơ/Văn trên thẻ xăm. Luận giải chi tiết dựa trên sở cầu của bạn.' 
                : 'AI sẽ kết hợp dữ liệu sinh trắc hình ảnh với Hồ sơ Tín chủ để đưa ra luận giải chính xác nhất.'}
            </p>
         </div>

         <div className="space-y-4">
            
            {/* DOMINANT HAND */}
            {type === 'PALM' && (
              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-brand-muted tracking-wider ml-1">Tay Thuận</label>
                <div className="flex bg-brand-dark/40 p-1 rounded-lg border border-white/5">
                  <button
                    onClick={() => setDominantHand('left')}
                    className={`flex-1 py-2.5 md:py-2 rounded text-xs font-medium transition-all ${dominantHand === 'left' ? 'bg-brand-secondary text-brand-accent shadow-sm border border-white/10' : 'text-brand-muted hover:text-white'}`}
                  >Trái</button>
                  <button
                    onClick={() => setDominantHand('right')}
                    className={`flex-1 py-2.5 md:py-2 rounded text-xs font-medium transition-all ${dominantHand === 'right' ? 'bg-brand-secondary text-brand-accent shadow-sm border border-white/10' : 'text-brand-muted hover:text-white'}`}
                  >Phải</button>
                </div>
              </div>
            )}

            {/* WISH LIST MULTI-SELECT - COMPACT VERSION */}
            {type === 'FORTUNE_PAPER' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                   <label className="text-xs uppercase font-bold text-brand-muted tracking-wider ml-1">Sở Cầu</label>
                   {selectedWishes.length > 0 && (
                      <span className="text-[10px] text-brand-accent bg-brand-accent/10 px-1.5 py-0.5 rounded border border-brand-accent/20">{selectedWishes.length} đã chọn</span>
                   )}
                </div>

                {/* Selected Tags View */}
                {!isWishListExpanded && (
                  <div className="flex flex-wrap gap-2">
                     {selectedWishes.map(wish => (
                        <span key={wish} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-brand-secondary border border-brand-accent/30 text-[10px] text-brand-text">
                           {wish}
                           <button onClick={() => toggleWish(wish)} className="hover:text-red-400"><X size={10} /></button>
                        </span>
                     ))}
                     <button 
                        onClick={() => setIsWishListExpanded(true)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-brand-accent/20 border border-brand-accent/30 text-[10px] text-brand-accent hover:bg-brand-accent/30 transition-colors"
                     >
                        <Plus size={10} /> {selectedWishes.length === 0 ? 'Chọn vấn sự' : 'Thêm'}
                     </button>
                  </div>
                )}

                {/* Expanded Selection List */}
                {isWishListExpanded && (
                  <div className="bg-brand-dark/50 border border-white/10 rounded-lg p-2 animate-fade-in">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {WISH_LIST.map((wish) => {
                          const isSelected = selectedWishes.includes(wish);
                          return (
                            <button
                              key={wish}
                              onClick={() => toggleWish(wish)}
                              className={`px-2 py-1.5 rounded text-[10px] font-medium border transition-all flex-grow text-center ${
                                isSelected 
                                  ? 'bg-brand-accent text-brand-dark border-brand-accent' 
                                  : 'bg-brand-secondary/50 text-brand-muted border-white/5 hover:border-white/20'
                              }`}
                            >
                              {wish}
                            </button>
                          );
                        })}
                      </div>
                      <button 
                         onClick={() => setIsWishListExpanded(false)}
                         className="w-full py-1.5 text-[10px] uppercase font-bold text-brand-muted hover:text-white bg-white/5 rounded hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
                      >
                         <ChevronUp size={12} /> Thu Gọn
                      </button>
                  </div>
                )}
                
                {!isWishListExpanded && selectedWishes.length === 0 && (
                  <p className="text-[10px] text-brand-muted italic">* Chưa chọn. AI sẽ luận giải tổng quát.</p>
                )}
              </div>
            )}
         </div>

         <div className="bg-brand-accent/5 p-3 rounded-lg border border-brand-accent/10 hidden md:block mt-auto">
            <div className="flex gap-2 items-start text-brand-accent text-xs">
               <Info size={14} className="mt-0.5 shrink-0" />
               <p>Dữ liệu hình ảnh được xử lý bảo mật.</p>
            </div>
         </div>
      </div>

      {/* Upload Area */}
      <div className="md:w-2/3 flex flex-col">
        <div className="flex-grow">
          {type === 'PALM' && (
            <div className="flex flex-col md:flex-row gap-4">
              {renderUploadBox(leftHand, setLeftHand, leftInputRef, "Tay Trái", "Tải ảnh lòng bàn tay trái")}
              {renderUploadBox(rightHand, setRightHand, rightInputRef, "Tay Phải", "Tải ảnh lòng bàn tay phải")}
              <input ref={leftInputRef} type="file" accept="image/*" className="hidden" onChange={handleLeftHandChange} />
              <input ref={rightInputRef} type="file" accept="image/*" className="hidden" onChange={handleRightHandChange} />
            </div>
          )}

          {type === 'FACE' && (
             <div className="w-full md:max-w-xs mx-auto">
                 {renderUploadBox(faceImage, setFaceImage, faceInputRef, "Dữ Liệu Khuôn Mặt", "Tải lên ảnh chân dung chính diện")}
                 <input ref={faceInputRef} type="file" accept="image/*" className="hidden" onChange={handleFaceChange} />
             </div>
          )}

          {type === 'FORTUNE_PAPER' && (
             <div className="w-full md:max-w-xs mx-auto">
                 {renderUploadBox(paperImage, setPaperImage, paperInputRef, "Hình Ảnh Tờ Xăm", "Tải ảnh rõ nét chứa nội dung thơ/lời phán")}
                 <input ref={paperInputRef} type="file" accept="image/*" className="hidden" onChange={handlePaperChange} />
             </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading || !isFormValid()}
          className="mt-6 md:mt-8 w-full btn-gold py-3.5 md:py-4 rounded-lg text-brand-dark font-bold uppercase tracking-widest text-sm disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-lg transition-all touch-manipulation"
        >
          {isLoading ? 'Đang Phân Tích...' : 'Khởi Chạy Phân Tích'}
        </button>
        {!isFormValid() && !isLoading && (
          <p className="text-center text-xs text-red-400 mt-2">Vui lòng tải ảnh lên để tiếp tục.</p>
        )}
      </div>
    </div>
  );
};

export default ImageAnalysis;
