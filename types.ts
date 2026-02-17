
export enum FeatureMode {
  HOROSCOPE = 'HOROSCOPE',
  PALM_READING = 'PALM_READING',
  FACE_READING = 'FACE_READING',
  FORTUNE_PAPER = 'FORTUNE_PAPER', // Renamed from TATTOO_READING
  DAILY_READING = 'DAILY_READING', 
}

export interface UserAttributes {
  name: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  wishes?: string[];
  lunarDate?: string; // Optional: Calculated Lunar Date string
}

export interface UserProfile {
  name: string;
  birthDay: number;
  birthMonth: number;
  birthYear: number;
  birthDate: string; // Derived YYYY-MM-DD for API
  calendarType: 'solar' | 'lunar';
  birthTimeStr: string; // HH:mm format
  gender: 'male' | 'female';
  viewYear: number;
  viewMonth: number;
}

export interface FortuneContent {
  number: string;        // Ví dụ: "Quẻ Số 1"
  name: string;          // Ví dụ: "Hán Cao Tổ nhập Quan" (Tên quẻ)
  nature: string;        // "Thượng Thượng" / "Trung Bình" / "Hạ Hạ"
  poem_han: string;      // Thơ chữ Hán (nếu có)
  poem_viet: string;     // Thơ dịch
  legend: string;        // "Điển Tích" (Giải thích câu chuyện lịch sử của quẻ)
  meaning_details: string; // Phân tích chi tiết từng câu thơ
}

// New Structure for Commercial Face Reading
export interface FaceAnalysisData {
  faceShape: string; // Ví dụ: Mặt chữ Điền, Mặt Trái Xoan
  element: string; // Ngũ hành khuôn mặt (Kim/Mộc...)
  harmonyScore: number; // Điểm phúc tướng (0-100)
  
  // NEW: Tam Đình (3 Zones) - Analyze life stages
  threeZones: {
      upper: string;  // Thượng đình (Tiền vận < 30 tuổi)
      middle: string; // Trung đình (Trung vận 31-50 tuổi)
      lower: string;  // Hạ đình (Hậu vận > 50 tuổi)
      goldenAge: string; // Giai đoạn vượng phát nhất
  };

  // Phân tích ngũ quan
  features: {
    eyes: string; // Thần thái đôi mắt
    nose: string; // Tướng mũi (Tài bạch)
    mouth: string; // Tướng miệng (Xuất nạp)
    brows: string; // Lông mày (Bảo thọ)
  };
  
  // 12 Cung Tướng Mệnh (Premium Content - Expanded)
  palaces: {
    wealth: string; // Cung Tài Bạch (Tiền)
    career: string; // Cung Quan Lộc (Sự nghiệp)
    marriage: string; // Cung Phu Thê (Vợ chồng)
    parents: string; // Cung Phụ Mẫu (Cha mẹ)
    property: string; // NEW: Cung Điền Trạch (Đất đai)
    children: string; // NEW: Cung Tử Tức (Con cái)
    migration: string; // NEW: Cung Thiên Di (Đi xa/Xuất ngoại)
    health: string; // NEW: Cung Tật Ách (Sức khỏe/Bệnh tật)
  };

  // Giải pháp cải vận (Monetization Hook)
  solutions: {
    hairStyle: string; // Gợi ý kiểu tóc
    accessories: string; // Kính mắt / Khuyên tai
    makeup: string; // Gợi ý trang điểm / Thẩm mỹ
    fengShuiItem: {     // UPDATED: Structured object
        itemName: string; // Tên vật phẩm (VD: Tỳ Hưu Thạch Anh)
        material: string; // Chất liệu (VD: Đá Thạch Anh Tóc Vàng)
        color: string;    // Màu sắc (VD: Vàng Kim)
        meaning: string;  // Ý nghĩa phong thủy chi tiết
    }; 
  };
}

export interface PredictionResult {
  title: string;
  overview: string; // Tóm tắt tổng quan
  luckScore: number; // 0-100
  luckyColor: string; // Màu hợp
  unluckyColor?: string; // Màu kỵ (New)
  luckyNumber: string;
  // Chi tiết từng phương diện
  details: {
    career: string; // Sự nghiệp & Công danh
    finance: string; // Tài lộc
    love: string; // Tình duyên & Gia đạo
    health: string; // Sức khỏe
  };
  advice: string; // Lời khuyên hành động
  userAttributes?: UserAttributes; // Added to store user context for the report
  fortuneContent?: FortuneContent; // New field for detailed Fortune Paper data
  faceAnalysis?: FaceAnalysisData; // New field for specialized Face Reading
  genderMismatch?: boolean; // New field: Checks if uploaded image gender matches profile
}

export interface ImageAnalysisPayload {
  files: File[];
  userProfile: UserProfile; // Updated to use the full profile
  dominantHand?: 'left' | 'right'; // Chỉ dùng cho xem chỉ tay
  wishes?: string[]; // Mảng các sở cầu (Dùng cho giải xăm)
}

// New Types for Daily Features
export interface DailyTarotResult {
  cardName: string;
  cardMeaning: string;
  message: string; // Thông điệp trong ngày
  keywords: string[];
}

export interface DailyLuckyResult {
  color: string;
  hexCode: string;
  number: string;
  quote: string;
}
