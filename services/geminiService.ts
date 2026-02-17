
import { GoogleGenAI, Type, Schema, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { PredictionResult, UserProfile, ImageAnalysisPayload, DailyTarotResult, DailyLuckyResult } from "../types";
import { convertSolarToLunar } from "../utils/dateUtils";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Base Schema parts to reuse
const baseProperties = {
  genderMismatch: { type: Type.BOOLEAN, nullable: true },
  title: { type: Type.STRING },
  overview: { type: Type.STRING },
  luckScore: { type: Type.INTEGER },
  luckyColor: { type: Type.STRING },
  unluckyColor: { type: Type.STRING },
  luckyNumber: { type: Type.STRING },
  details: {
    type: Type.OBJECT,
    properties: {
      career: { type: Type.STRING },
      finance: { type: Type.STRING },
      love: { type: Type.STRING },
      health: { type: Type.STRING },
    },
    required: ["career", "finance", "love", "health"]
  },
  advice: { type: Type.STRING },
  fortuneContent: {
    type: Type.OBJECT,
    properties: {
      number: { type: Type.STRING },
      name: { type: Type.STRING },
      nature: { type: Type.STRING },
      poem_han: { type: Type.STRING },
      poem_viet: { type: Type.STRING },
      legend: { type: Type.STRING },
      meaning_details: { type: Type.STRING },
    },
    nullable: true
  },
  faceAnalysis: {
    type: Type.OBJECT,
    properties: {
      faceShape: { type: Type.STRING },
      element: { type: Type.STRING },
      harmonyScore: { type: Type.INTEGER },
      features: {
        type: Type.OBJECT,
        properties: {
            eyes: { type: Type.STRING },
            nose: { type: Type.STRING },
            mouth: { type: Type.STRING },
            brows: { type: Type.STRING },
        },
        required: ["eyes", "nose", "mouth", "brows"]
      },
      palaces: {
        type: Type.OBJECT,
        properties: {
            wealth: { type: Type.STRING },
            career: { type: Type.STRING },
            marriage: { type: Type.STRING },
            parents: { type: Type.STRING },
        },
        required: ["wealth", "career", "marriage", "parents"]
      },
      solutions: {
        type: Type.OBJECT,
        properties: {
            hairStyle: { type: Type.STRING },
            accessories: { type: Type.STRING },
            makeup: { type: Type.STRING },
            fengShuiItem: { type: Type.STRING },
        },
        required: ["hairStyle", "accessories", "makeup", "fengShuiItem"]
      }
    },
    nullable: true
  }
};

const JSON_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: baseProperties,
  required: ["title", "overview", "luckScore", "luckyColor", "unluckyColor", "luckyNumber", "details", "advice"],
};

const TAROT_CARDS = [
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor", 
  "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit", 
  "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance", 
  "The Devil", "The Tower", "The Star", "The Moon", "The Sun", 
  "Judgement", "The World", "Ace of Wands", "Ace of Cups", "Ace of Swords", "Ace of Pentacles"
];

/**
 * Helper to compress and convert image to Base64
 * Max dimension 800px (Reduced from 1024px for speed), JPEG quality 0.6
 */
const compressImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }

      // Resize logic - Optimize for AI Vision Speed
      const MAX_SIZE = 800;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      
      // Draw white background (for transparent PNGs)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      
      ctx.drawImage(img, 0, 0, width, height);

      // Compress to JPEG 0.7 (Increased quality slightly for better face features)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      resolve(dataUrl.split(',')[1]);
    };
    
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
  });
};

export const fileToGenerativePart = async (file: File): Promise<{ mimeType: string, data: string }> => {
  try {
    const base64Data = await compressImage(file);
    return { mimeType: 'image/jpeg', data: base64Data };
  } catch (error) {
    console.error("Compression failed, falling back to raw", error);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        resolve({ mimeType: file.type, data: base64Data });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};

/**
 * Generate Text Horoscope based on birth date
 */
export const getHoroscopePrediction = async (user: UserProfile): Promise<PredictionResult> => {
  const prompt = `
    Đóng vai: Đại sư Tử Vi Đẩu Số. Luận giải vận hạn 2026 cho:
    - ${user.name}, ${user.birthDate}, ${user.gender === 'male' ? 'Nam' : 'Nữ'}

    YÊU CẦU:
    1. Khách quan: Nói rõ Tốt/Xấu.
    2. Format Markdown cho 'details' (BẮT BUỘC):
       ✅ ĐIỂM SÁNG: ...
       ⚠️ CẢNH BÁO: ...

    Output JSON theo schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: JSON_SCHEMA,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");
    
    const result = JSON.parse(jsonText) as PredictionResult;
    
    const dateObj = new Date(user.birthDate);
    const lunar = convertSolarToLunar(dateObj.getDate(), dateObj.getMonth() + 1, dateObj.getFullYear());
    
    result.userAttributes = {
        name: user.name,
        birthDate: user.birthDate,
        gender: user.gender,
        lunarDate: `${lunar.canChiYear}`
    };

    return result;
  } catch (error) {
    console.error("Horoscope Error:", error);
    throw new Error("Không thể luận giải tử vi lúc này. Vui lòng thử lại.");
  }
};

/**
 * Analyze Image (Palm, Face or Fortune Paper)
 */
export const getImageAnalysis = async (
  payload: ImageAnalysisPayload, 
  type: 'PALM' | 'FACE' | 'FORTUNE_PAPER'
): Promise<PredictionResult> => {
  const imageParts = await Promise.all(payload.files.map(file => fileToGenerativePart(file)));
  const genderStr = payload.userProfile.gender === 'male' ? 'Nam' : 'Nữ';
  
  const kycInfo = `Hồ sơ: ${payload.userProfile.name}, ${payload.userProfile.birthDate}, ${genderStr}`;

  let systemInstruction = "";
  let promptText = "";

  const formattingInstruction = `
    Trong 'details' bắt buộc dùng format:
    ✅ ĐIỂM SÁNG: [Nội dung]
    ⚠️ CẢNH BÁO: [Nội dung]
  `;

  if (type === 'PALM') {
    systemInstruction = "Chuyên gia Sinh trắc vân tay & Tử vi.";
    promptText = `Phân tích chỉ tay & vận 2026 cho: ${kycInfo}. ${formattingInstruction}`;
  } else if (type === 'FORTUNE_PAPER') {
    const wishesStr = payload.wishes && payload.wishes.length > 0 ? payload.wishes.join(", ") : "Vận hạn chung";
    systemInstruction = "Chuyên gia giải quẻ xăm.";
    promptText = `Đọc ảnh xăm & giải nghĩa cho sở cầu: ${wishesStr}. ${kycInfo}. ${formattingInstruction}`;
  } else {
    // === FACE READING ===
    systemInstruction = "Đại sư Nhân tướng học & Thẩm mỹ.";
    
    promptText = `
      Thông tin hồ sơ: ${kycInfo}

      BƯỚC 1: KIỂM TRA GIỚI TÍNH (FACE ID CHECK)
      - Hãy quan sát kỹ khuôn mặt trong ảnh.
      - So sánh với giới tính trong hồ sơ: "${genderStr}".
      - Nếu đặc điểm sinh học của khuôn mặt RÕ RÀNG KHÁC BIỆT với giới tính hồ sơ (Ví dụ: Hồ sơ Nam nhưng ảnh là Nữ, hoặc ngược lại):
         -> Trả về JSON với "genderMismatch": true.
         -> Các trường bắt buộc khác (title, overview...) điền giá trị giả định (ví dụ: "Sai thông tin") để đảm bảo đúng format JSON.
         -> DỪNG PHÂN TÍCH.
      - Nếu trùng khớp, hoặc ảnh khó xác định (trẻ em, ảnh mờ):
         -> Set "genderMismatch": false.
         -> TIẾP TỤC BƯỚC 2.

      BƯỚC 2: PHÂN TÍCH DIỆN TƯỚNG & GỢI Ý CẢI VẬN CHUYÊN SÂU
      
      QUAN TRỌNG:
      - Phân tích sâu sắc, cụ thể từng bộ phận.
      - Nếu ảnh mờ, phân tích dựa trên Tướng Mệnh Tổng Quát của độ tuổi và giới tính.

      OUTPUT FORMAT:
      PHẦN 1: FACE ANALYSIS (Bắt buộc điền object 'faceAnalysis')
      - faceShape, element, harmonyScore (0-100).
      - features: Phân tích chi tiết hình dáng và ý nghĩa tướng số của Mắt, Mũi, Miệng, Lông mày (mỗi mục viết khoảng 3-4 câu, phân tích sâu).
      - palaces: Luận giải sâu về Cung Tài Bạch, Quan Lộc, Phu Thê, Phụ Mẫu dựa trên các bộ vị (mỗi mục 3-4 câu).
      
      PHẦN 2: GIẢI PHÁP CẢI VẬN (Solutions) - Cần cực kỳ chi tiết và thực tế:
      - hairStyle: Gợi ý kiểu tóc cụ thể phù hợp khuôn mặt và ngũ hành, giải thích tại sao.
      - accessories: Gợi ý chi tiết kính, khuyên tai hoặc phụ kiện đi kèm để cân bằng gương mặt.
      - makeup: Hướng dẫn trang điểm hoặc thẩm mỹ (nếu cần) để che khuyết điểm, tăng vượng khí.
      - fengShuiItem: Tên vật phẩm + Chất liệu + Màu sắc + Ý nghĩa phong thủy chi tiết (Viết 1 đoạn văn ngắn mô tả đầy đủ).

      PHẦN 3: VẬN HẠN 2026 CHI TIẾT
      Trong 'details' (Sự nghiệp, Tài lộc, Tình duyên, Sức khỏe), hãy viết nội dung dài, chi tiết, cụ thể hóa các tháng tốt/xấu nếu có thể.
      
      QUY TẮC FORMAT DETAILS:
      - Bắt buộc chia thành 2 phần: Điểm Sáng và Cảnh Báo.
      - Sử dụng format chính xác:
      ✅ ĐIỂM SÁNG: [Nội dung chi tiết...]
      ⚠️ CẢNH BÁO: [Nội dung chi tiết...]
      - TUYỆT ĐỐI KHÔNG sử dụng dấu ** (bôi đậm) trong nội dung văn bản.
    `;
  }

  // Adjust Schema for Face Reading to ensure faceAnalysis is required
  const schemaToUse: Schema = { ...JSON_SCHEMA };
  if (type === 'FACE') {
    schemaToUse.required = [...(JSON_SCHEMA.required || []), "faceAnalysis"];
  }

  try {
    const parts: any[] = imageParts.map(part => ({
      inlineData: {
        mimeType: part.mimeType,
        data: part.data
      }
    }));
    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: { parts },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schemaToUse,
        // Disable Safety Settings for Face Reading to avoid false positives on biological traits
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
        ]
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");
    
    const result = JSON.parse(jsonText) as PredictionResult;

    const dateObj = new Date(payload.userProfile.birthDate);
    const lunar = convertSolarToLunar(dateObj.getDate(), dateObj.getMonth() + 1, dateObj.getFullYear());

    result.userAttributes = {
        name: payload.userProfile.name,
        birthDate: payload.userProfile.birthDate,
        gender: payload.userProfile.gender,
        wishes: payload.wishes,
        lunarDate: `${lunar.canChiYear}`
    };

    return result;

  } catch (error) {
    console.error("Image Analysis Error:", error);
    throw new Error("Không thể phân tích ảnh. Vui lòng thử lại với ảnh rõ nét hơn.");
  }
};

/**
 * Follow-up Chat
 */
export const sendFollowUpQuestion = async (
  historyContext: PredictionResult, 
  userQuestion: string
): Promise<string> => {
  const prompt = `
    Dữ liệu cũ: ${historyContext.overview}.
    Câu hỏi: "${userQuestion}".
    Trả lời ngắn gọn (dưới 150 chữ) phong thái thầy bói.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Xin thử lại sau.";
  } catch (error) {
    return "Mất kết nối với thiên cơ.";
  }
};

/**
 * Daily Tarot
 */
export const getDailyTarotReading = async (): Promise<DailyTarotResult> => {
  const randomCard = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
  const prompt = `Tarot card: "${randomCard}". Meaning & Message today. Vietnamese. JSON output.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      cardName: { type: Type.STRING },
      cardMeaning: { type: Type.STRING },
      message: { type: Type.STRING },
      keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ["cardName", "cardMeaning", "message", "keywords"],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    const result = JSON.parse(response.text) as DailyTarotResult;
    result.cardName = randomCard; 
    return result;
  } catch (error) {
    throw new Error("Lỗi kết nối Tarot.");
  }
};

/**
 * Daily Lucky Stats
 */
export const getDailyLuckyStats = async (): Promise<DailyLuckyResult> => {
  const prompt = `Lucky color (hex), number, quote today. Vietnamese. JSON output.`;
  const schema = {
    type: Type.OBJECT,
    properties: {
      color: { type: Type.STRING },
      hexCode: { type: Type.STRING },
      number: { type: Type.STRING },
      quote: { type: Type.STRING },
    },
    required: ["color", "hexCode", "number", "quote"],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    return JSON.parse(response.text) as DailyLuckyResult;
  } catch (error) {
    throw new Error("Lỗi kết nối vận may.");
  }
};
