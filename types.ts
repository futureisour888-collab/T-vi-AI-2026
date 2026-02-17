
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
