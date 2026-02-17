
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
      
      // NEW: Tam Dinh (3 Zones)
      threeZones: {
         type: Type.OBJECT,
         properties: {
            upper: { type: Type.STRING, description: "Phân tích Thượng đình (Trán) - Tiền vận" },
            middle: { type: Type.STRING, description: "Phân tích Trung đình (Mũi, Gò má) - Trung vận" },
            lower: { type: Type.STRING, description: "Phân tích Hạ đình (Cằm, Hàm) - Hậu vận" },
            goldenAge: { type: Type.STRING, description: "Giai đoạn hoàng kim nhất (Ví dụ: Trung niên 35-50 tuổi)" }
         },
         required: ["upper", "middle", "lower", "goldenAge"]
      },

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
      
      // EXPANDED: 8 Major Palaces
      palaces: {
        type: Type.OBJECT,
        properties: {
            wealth: { type: Type.STRING, description: "Cung Tài Bạch" },
            career: { type: Type.STRING, description: "Cung Quan Lộc" },
            marriage: { type: Type.STRING, description: "Cung Phu Thê" },
            parents: { type: Type.STRING, description: "Cung Phụ Mẫu" },
            property: { type: Type.STRING, description: "Cung Điền Trạch (Nhà đất)" },
            children: { type: Type.STRING, description: "Cung Tử Tức (Con cái)" },
            migration: { type: Type.STRING, description: "Cung Thiên Di (Xuất ngoại/Đi xa)" },
            health: { type: Type.STRING, description: "Cung Tật Ách (Sức khỏe tiềm ẩn)" },
        },
        required: ["wealth", "career", "marriage", "parents", "property", "children", "migration", "health"]
      },
      
      solutions: {
        type: Type.OBJECT,
        properties: {
            hairStyle: { type: Type.STRING },
            accessories: { type: Type.STRING },
            makeup: { type: Type.STRING },
            fengShuiItem: { 
                type: Type.OBJECT,
                properties: {
                    itemName: { type: Type.STRING },
                    material: { type: Type.STRING },
                    color: { type: Type.STRING },
                    meaning: { type: Type.STRING },
                },
                required: ["itemName", "material", "color", "meaning"]
            },
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

    YÊU CẦU QUAN TRỌNG:
    1. Giọng văn: Trang trọng, khách quan, chuyên nghiệp. Tuyệt đối KHÔNG dùng văn nói, KHÔNG chat với người dùng (ví dụ: không dùng "nhé", "nha", "hì hì", "bye bye").
    2. Nội dung: Tập trung vào phân tích vận hạn, không lan man.
    3. Format Markdown cho 'details' (BẮT BUỘC):
       ✅ ĐIỂM SÁNG: [Nội dung tốt...]
       ⚠️ CẢNH BÁO: [Nội dung xấu/cần tránh...]

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
    systemInstruction = "Bạn là Chuyên gia Sinh trắc vân tay & Tử vi. Phân tích khoa học, khách quan.";
    promptText = `Phân tích chỉ tay & vận 2026 cho: ${kycInfo}. ${formattingInstruction}`;
  } else if (type === 'FORTUNE_PAPER') {
    const wishesStr = payload.wishes && payload.wishes.length > 0 ? payload.wishes.join(", ") : "Vận hạn chung";
    systemInstruction = "Bạn là Chuyên gia giải quẻ xăm. Giải nghĩa trang trọng, cổ văn.";
    promptText = `Đọc ảnh xăm & giải nghĩa cho sở cầu: ${wishesStr}. ${kycInfo}. ${formattingInstruction}`;
  } else {
    // === FACE READING ===
    // STRICT SYSTEM INSTRUCTION TO PREVENT CHATTINESS
    systemInstruction = "Bạn là chuyên gia Nhân tướng học và Tử vi số 1. Phong cách: Chuyên nghiệp, Nghiêm túc, Sâu sắc. TUYỆT ĐỐI KHÔNG dùng văn nói, từ ngữ cợt nhả, từ ngữ giao tiếp dư thừa. Chỉ trả về dữ liệu phân tích.";
    
    promptText = `
      Thông tin hồ sơ: ${kycInfo}

      BƯỚC 1: KIỂM TRA GIỚI TÍNH (FACE ID CHECK)
      - Quan sát kỹ khuôn mặt. So sánh với giới tính hồ sơ: "${genderStr}".
      - Nếu khác biệt sinh học rõ ràng (VD: Hồ sơ Nam - Ảnh Nữ): trả về "genderMismatch": true.
      - Nếu trùng khớp: trả về "genderMismatch": false và TIẾP TỤC BƯỚC 2.

      BƯỚC 2: PHÂN TÍCH DIỆN TƯỚNG & GỢI Ý CẢI VẬN CHUYÊN SÂU
      
      YÊU CẦU QUAN TRỌNG:
      - Phân tích sâu sắc, khoa học dựa trên ngũ quan, tam đình, ngũ nhạc.
      - KHÔNG được viết kiểu trò chuyện, KHÔNG chào hỏi.
      - Nội dung phải là văn bản báo cáo chuyên ngành.

      OUTPUT FORMAT (JSON):
      PHẦN 1: FACE ANALYSIS
      - faceShape, element, harmonyScore (0-100).
      
      - THÊM MỚI: threeZones (Tam Đình):
        + upper: Luận giải Thượng Đình (Trán - Tiền vận - Trí tuệ).
        + middle: Luận giải Trung Đình (Mũi, Má - Trung vận - Ý chí).
        + lower: Luận giải Hạ Đình (Cằm - Hậu vận - Tình cảm).
        + goldenAge: Kết luận giai đoạn sung túc nhất (VD: Trung vận 30-50t).

      - features: Phân tích Mắt, Mũi, Miệng, Lông mày.
      
      - palaces (12 CUNG MỞ RỘNG): Luận giải 8 cung quan trọng nhất:
        1. Wealth (Tài Bạch)
        2. Career (Quan Lộc)
        3. Marriage (Phu Thê)
        4. Parents (Phụ Mẫu)
        5. Property (Điền Trạch - Đất đai) -> RẤT QUAN TRỌNG
        6. Children (Tử Tức - Con cái)
        7. Migration (Thiên Di - Xuất ngoại)
        8. Health (Tật Ách - Sức khỏe tiềm ẩn)
      
      PHẦN 2: GIẢI PHÁP CẢI VẬN
      - hairStyle, accessories, makeup, fengShuiItem.

      PHẦN 3: VẬN HẠN 2026 CHI TIẾT
      Trong 'details' (Sự nghiệp, Tài lộc, Tình duyên, Sức khỏe):
      - Viết nội dung phân tích cụ thể, độ dài vừa đủ.
      
      QUY TẮC FORMAT DETAILS:
      - Bắt buộc chia thành 2 phần: Điểm Sáng và Cảnh Báo.
      - Sử dụng format chính xác:
      ✅ ĐIỂM SÁNG: [Nội dung...]
      ⚠️ CẢNH BÁO: [Nội dung...]
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
    Trả lời ngắn gọn (dưới 150 chữ) phong thái thầy bói, nghiêm túc, không cợt nhả.
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
  const prompt = `Tarot card: "${randomCard}". Meaning & Message today. Vietnamese. JSON output. Concise.`;

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
