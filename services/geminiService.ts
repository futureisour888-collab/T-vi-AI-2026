
import { GoogleGenAI, Type } from "@google/genai";
import { PredictionResult, UserProfile, ImageAnalysisPayload, DailyTarotResult, DailyLuckyResult } from "../types";
import { convertSolarToLunar } from "../utils/dateUtils";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Complex Schema for structured output
const JSON_SCHEMA = {
  type: Type.OBJECT,
  properties: {
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
  },
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
 * Max dimension 1024px, JPEG quality 0.7
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

      // Resize logic
      const MAX_SIZE = 1024;
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

      // Compress to JPEG 0.7
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
    // Fallback if compression fails
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
    Đóng vai: Đại sư Tử Vi Đẩu Số & Cố vấn Chiến lược Cuộc đời (Life Strategy Consultant).
    Nhiệm vụ: Luận giải vận hạn chuyên sâu năm 2026 (Bính Ngọ) cho khách hàng VIP:
    - Họ tên: ${user.name}
    - Ngày sinh: ${user.birthDate}
    - Giới tính: ${user.gender === 'male' ? 'Nam' : 'Nữ'}

    YÊU CẦU CỐT LÕI (CRITICAL):
    1. **Tính Khách Quan:** Tuyệt đối KHÔNG được chỉ nói điều tốt. Phải phân tích sòng phẳng cả Tốt (Cát) và Xấu (Hung).
    2. **Màu Sắc & Con Số:**
       - luckyColor: Liệt kê các màu hợp (Ví dụ: "Đỏ, Vàng, Cam").
       - unluckyColor: Liệt kê các màu KỴ/KHẮC (Ví dụ: "Đen, Xanh Dương").
       - luckyNumber: 1-2 con số may mắn nhất.
    3. **Cấu Trúc Báo Cáo Chi Tiết (BẮT BUỘC):** 
       Trong MỖI mục thuộc 'details' (career, finance, love, health), bạn KHÔNG được viết đoạn văn liền mạch. Bạn BẮT BUỘC phải chia nội dung thành 2 phần rõ rệt sử dụng định dạng Markdown sau:
       
       **✅ ĐIỂM SÁNG:**
       - [Liệt kê các cơ hội, may mắn, thời cơ tốt...]
       
       **⚠️ CẢNH BÁO:**
       - [Liệt kê các rủi ro, hạn chế, tiểu nhân, tháng xấu cần tránh...]

    Yêu cầu phân tích cụ thể:
    1. Xác định Thiên Can, Địa Chi, Mệnh ngũ hành so với năm 2026.
    2. Dự báo chi tiết 4 phương diện (Sử dụng cấu trúc Điểm Sáng/Cảnh Báo ở trên):
       - Công danh: Cơ hội thăng tiến vs Rủi ro pháp lý/tiểu nhân.
       - Tài lộc: Nguồn thu vs Nguy cơ hao tài.
       - Tình duyên: Hạnh phúc vs Xung đột.
       - Sức khỏe: Thể trạng vs Hạn bệnh tật.

    Văn phong: Chuyên nghiệp, gãy gọn, mang tính tư vấn giải pháp.
    Output: JSON format theo schema đã định.
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
    
    // Inject User Info
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
  
  // Thông tin KYC để kết hợp phân tích
  const kycInfo = `
    THÔNG TIN ĐỊNH DANH ĐỐI TƯỢNG (KYC):
    - Họ tên: ${payload.userProfile.name}
    - Ngày sinh: ${payload.userProfile.birthDate}
    - Giới tính: ${genderStr}
  `;

  let systemInstruction = "";
  let promptText = "";

  // Common instruction for details formatting
  const formattingInstruction = `
    QUAN TRỌNG VỀ ĐỊNH DẠNG (FORMATTING):
    Trong các trường 'details' (career, finance, love, health), bạn BẮT BUỘC phải trình bày theo cấu trúc 2 phần:
    
    **✅ ĐIỂM SÁNG:**
    - [Nội dung tích cực...]
    
    **⚠️ CẢNH BÁO:**
    - [Nội dung tiêu cực/rủi ro...]
  `;

  if (type === 'PALM') {
    systemInstruction = "Bạn là hệ thống AI cố vấn chiến lược cuộc đời, chuyên gia Sinh trắc học vân tay (Palmistry Expert) và Tử vi học. Hãy phân tích hình ảnh bàn tay được cung cấp.";
    promptText = `
      ${kycInfo}
      
      NHIỆM VỤ: Thực hiện phân tích chi tiết chuyên sâu (Deep Dive Palmistry Analysis) kết hợp Tướng Tay và Vận Niên 2026 (Bính Ngọ).

      YÊU CẦU QUAN SÁT KỸ LƯỠNG CÁC CHI TIẾT SAU:
      1. **HÌNH DÁNG BÀN TAY & NGÓN TAY:** Kiểu tay, độ cứng mềm.
      2. **CÁC GÒ (MOUNTS):** Mộc Tinh, Thổ Tinh, Thái Dương... Tìm dấu hiệu lạ.
      3. **CÁC ĐƯỜNG CHỈ TAY CHÍNH:** Sinh Đạo, Trí Đạo, Tâm Đạo, Định Mệnh.
      4. **CÁC ĐƯỜNG PHỤ:** Thái Dương, Du Lịch, Hôn Nhân.

      KẾT HỢP VỚI TỬ VI 2026:
      - Dựa trên các dấu hiệu trên, hãy luận giải vận hạn năm 2026.
      - luckyColor: Màu hợp.
      - unluckyColor: Màu kỵ.
      
      ${formattingInstruction}
      
      Lưu ý: Nếu ảnh mờ hoặc không thấy rõ chỉ tay, hãy dựa vào thông tin ngày sinh để luận giải tử vi kết hợp tướng tay tổng quan.
    `;
  } else if (type === 'FORTUNE_PAPER') {
    const wishesStr = payload.wishes && payload.wishes.length > 0 ? payload.wishes.join(", ") : "Tổng quát (Vận hạn chung)";

    systemInstruction = "Bạn là Nhà Nghiên cứu Văn hóa Tâm linh & Hán Nôm học, chuyên gia giải quẻ xăm. Hãy đọc nội dung văn bản trong ảnh (OCR) và luận giải.";
    promptText = `
      ${kycInfo}
      - VẤN ĐỀ GIA CHỦ ĐANG CẦU (SỞ CẦU): ${wishesStr}

      NHIỆM VỤ: Thực hiện quy trình "Đọc & Giải Xăm Chi Tiết".

      GIAI ĐOẠN 1: NHẬN DIỆN VĂN BẢN (OCR)
      - Hãy đọc thật kỹ nội dung văn bản trên tờ xăm trong ảnh.
      - Cố gắng xác định **Số Quẻ** và **Tên Quẻ**. Nếu ảnh mờ không đọc được Tên Quẻ, hãy tự suy luận dựa trên các từ khóa đọc được hoặc trả về "Quẻ Ẩn".
      - Xác định Phẩm cấp (Nature): Thượng Thượng, Trung Bình, hay Hạ Hạ?
      - Trích xuất nguyên văn bài thơ. Nếu không đọc được, hãy sáng tác một bài thơ thất ngôn tứ tuyệt phù hợp với ý nghĩa dự đoán.

      GIAI ĐOẠN 2: PHÂN TÍCH ĐIỂN TÍCH (STORYTELLING)
      - Dựa vào Tên Quẻ, hãy kể lại ngắn gọn **Điển Tích** (Legend).

      GIAI ĐOẠN 3: LUẬN GIẢI CHI TIẾT SỞ CẦU (DEEP ANALYSIS)
      - Phân tích chi tiết từng câu thơ.
      - Dựa trên ý nghĩa quẻ, hãy phân tích chi tiết cho CÁC SỞ CẦU: ${wishesStr}.
      
      ${formattingInstruction}
      
      QUAN TRỌNG: Chỉ trả về nội dung cho các mục có liên quan đến SỞ CẦU. Các mục khác trả về chuỗi rỗng "".
      *Trường hợp ngoại lệ: Nếu người dùng không chọn sở cầu nào, hãy luận giải tổng quát vào cả 4 mục.*
    `;
  } else {
    // FACE
    systemInstruction = "Bạn là Đại sư Nhân tướng học (Physiognomy Master). Hãy phân tích khuôn mặt trong ảnh.";
    promptText = `
      ${kycInfo}

      NHIỆM VỤ: Thực hiện phân tích đa chiều dựa trên Diện Tướng (Face Reading) và Vận Niên 2026.

      YÊU CẦU PHÂN TÍCH CHUYÊN SÂU:
      1. **NGŨ HÀNH TƯỚNG PHÁP:** Khuôn mặt hành gì? Tương hợp với năm Bính Ngọ (Thủy) không?
      2. **CÂN BẰNG ÂM DƯƠNG & TAM ĐÌNH:** Trán, Mắt/Mũi, Cằm.
      3. **CHI TIẾT NGŨ QUAN:** Mắt, Mũi, Ấn Đường, Miệng.

      KẾT HỢP VỚI TỬ VI 2026:
      - Luận giải cơ hội và rủi ro dựa trên tướng mặt.
      - luckyColor: Màu hợp.
      - unluckyColor: Màu kỵ.

      ${formattingInstruction}
      
      Lưu ý: Nếu không nhận diện được rõ khuôn mặt, hãy luận giải dựa trên thông tin ngày sinh (Tử vi) và đưa ra lời khuyên chung về tướng mạo/thần thái.
    `;
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
        responseSchema: JSON_SCHEMA,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");
    
    const result = JSON.parse(jsonText) as PredictionResult;

    // Inject User Info & Lunar Date
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
    throw new Error("Không thể phân tích dữ liệu. Vui lòng thử ảnh khác nhỏ hơn hoặc rõ nét hơn.");
  }
};

/**
 * Follow-up Chat with the Master
 * Context-aware chat based on previous prediction
 */
export const sendFollowUpQuestion = async (
  historyContext: PredictionResult, 
  userQuestion: string
): Promise<string> => {
  const prompt = `
    Ngữ cảnh: Bạn vừa thực hiện một quẻ bói chi tiết cho người dùng (dữ liệu bên dưới).
    
    DỮ LIỆU ĐÃ DỰ ĐOÁN:
    - Tổng quan: ${historyContext.overview}
    - Sự nghiệp: ${historyContext.details.career}
    - Tài chính: ${historyContext.details.finance}
    - Tình duyên: ${historyContext.details.love}
    - Sức khỏe: ${historyContext.details.health}
    - Điểm số: ${historyContext.luckScore}
    ${historyContext.fortuneContent ? `- Chi tiết Xăm: ${JSON.stringify(historyContext.fortuneContent)}` : ''}
    
    CÂU HỎI MỚI CỦA NGƯỜI DÙNG: "${userQuestion}"
    
    NHIỆM VỤ:
    Trả lời câu hỏi này ngắn gọn, đi vào trọng tâm (dưới 150 chữ), giữ phong thái của một bậc thầy tử vi, nhân tướng học. 
    Nếu câu hỏi liên quan đến cách hóa giải vận hạn, hãy đưa ra lời khuyên phong thủy cụ thể (màu sắc, hướng, vật phẩm).
    Tuyệt đối không lặp lại nguyên văn lời dự đoán cũ, hãy mở rộng thêm.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        // No structured JSON needed here, just text conversation
      },
    });

    return response.text || "Đại sư đang tịnh tâm, xin thí chủ hỏi lại sau.";
  } catch (error) {
    console.error("Chat Error:", error);
    throw new Error("Không thể kết nối với Đại sư lúc này.");
  }
};

/**
 * Daily Tarot Reading
 */
export const getDailyTarotReading = async (): Promise<DailyTarotResult> => {
  // Randomly select a card client-side to ensure variety and prevent "I can't pick" responses
  const randomCard = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
  
  const prompt = `
    Nhiệm vụ: Đóng vai một Tarot Reader chuyên nghiệp và huyền bí.
    Hành động: Lá bài được bốc cho ngày hôm nay là "${randomCard}".
    
    Yêu cầu:
    1. Giải thích ý nghĩa của lá bài này trong bối cảnh năng lượng ngày hôm nay.
    2. Đưa ra một thông điệp dẫn đường ngắn gọn, truyền cảm hứng.
    3. Trả về định dạng JSON chính xác.
    
    Lưu ý: Ngôn ngữ tiếng Việt, văn phong huyền bí nhưng tích cực.
  `;

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

    // Override the card name with the one we picked to ensure consistency if AI drifts
    const result = JSON.parse(response.text) as DailyTarotResult;
    result.cardName = randomCard; 
    return result;
  } catch (error) {
    console.error("Tarot Error:", error);
    throw new Error("Vũ trụ đang biến động, không thể kết nối năng lượng bài lúc này.");
  }
};

/**
 * Daily Lucky Stats
 */
export const getDailyLuckyStats = async (): Promise<DailyLuckyResult> => {
  const prompt = `
    Nhiệm vụ: Đóng vai Thầy Phong Thủy xem ngày tốt xấu.
    Hành động: Tính toán năng lượng ngày hôm nay (dựa trên ngày hiện tại).
    
    Yêu cầu:
    1. Đưa ra 01 màu sắc may mắn (kèm mã HEX).
    2. Đưa ra 01 con số may mắn (0-99).
    3. Một câu triết lý/lời khuyên (quote) ngắn gọn theo phong cách Khổng Minh hoặc triết lý Đông Phương để khích lệ tinh thần.
    
    Output JSON.
  `;

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
    console.error("Lucky Stats Error:", error);
    throw new Error("Không thể luận giải vận may lúc này.");
  }
};
