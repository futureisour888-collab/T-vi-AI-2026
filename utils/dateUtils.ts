
/*
 * Lunar Calendar Converter for 1900-2100
 * Based on standard Lunar Calendar algorithms (Hồ Ngọc Đức)
 */

// Dữ liệu 1900-2100 (Compressed Hex)
// Mỗi phần tử chứa thông tin của một năm âm lịch:
// - 4 bit cuối: Tháng nhuận (0 nếu không nhuận)
// - 12-13 bit đầu: Độ dài các tháng (1=30 ngày, 0=29 ngày). Bit 16 (cao nhất) tương ứng tháng 1.
const LUNAR_YEAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0,
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
  0x092e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
  0x0d520 // 2100
];

const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

/**
 * Tính số ngày Julian (Julian Day Number)
 */
const jdn = (dd: number, mm: number, yy: number) => {
  const a = Math.floor((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  return dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
};

/**
 * Chuyển đổi Dương Lịch sang Âm Lịch
 */
export const convertSolarToLunar = (dd: number, mm: number, yy: number) => {
    // Julian Day Number
    const jd = jdn(dd, mm, yy);
    
    // Mốc: 29/1/1900 Dương Lịch là Mùng 1 Tết Canh Tý (JD = 2415049) - Chú ý sai số nếu dùng mốc 31/1
    // Tuy nhiên theo thuật toán Hồ Ngọc Đức, mốc tính là 30/1/1900 Âm lịch (tức 31/1/1900 Dương lịch) có JD = 2415051
    // Nhưng bảng số liệu thường bắt đầu từ 1900.
    // Dùng thuật toán chuẩn tắc:
    // JD của ngày 11/11/1900 âm lịch (tức 1/1/1901 dương) là 2415386.
    
    // Ta dùng mốc: JD = 2415021 tương ứng với ngày 29/12/1899 Âm lịch (tức 30/1/1900 Dương lịch).
    // Ngày 31/1/1900 Dương lịch là Mùng 1 Tết Canh Tý.
    
    // Số ngày từ 31/1/1900 (Mùng 1 Tết Canh Tý) đến ngày hiện tại
    let offset = jd - 2415051; 
    
    // Nếu ngày nhập < 31/1/1900, thuật toán này không hỗ trợ chính xác (chỉ 1900-2100).
    // Ta giả định người dùng sinh sau 1900.

    let lunarYear = 1900;
    let daysInYear = 0;
    
    // 1. Tìm năm Âm Lịch
    while (lunarYear < 2100) {
        // Tính tổng số ngày trong năm lunarYear
        const yearInfo = LUNAR_YEAR_INFO[lunarYear - 1900];
        const leapMonth = yearInfo & 0xf;
        
        daysInYear = 348; // 12 * 29
        
        // Cộng thêm các tháng đủ (30 ngày)
        for (let m = 0; m < 12; m++) {
            // Bit 15 -> Month 1, Bit 4 -> Month 12
            if ((yearInfo & (0x8000 >> m)) > 0) {
                daysInYear++;
            }
        }
        
        // Cộng thêm tháng nhuận nếu có
        if (leapMonth > 0) {
            // Bit đại diện tháng nhuận nằm ở vị trí 16 (0x10000)
            const leapDays = (yearInfo & 0x10000) ? 30 : 29;
            daysInYear += leapDays;
        }
        
        if (offset < daysInYear) {
            break;
        }
        
        offset -= daysInYear;
        lunarYear++;
    }
    
    // 2. Tìm tháng Âm Lịch
    const yearInfo = LUNAR_YEAR_INFO[lunarYear - 1900];
    const leapMonth = yearInfo & 0xf;
    let isLeap = false;
    let lunarMonth = 1;
    
    for (lunarMonth = 1; lunarMonth <= 12; lunarMonth++) {
        // Bit 15 -> Month 1
        const daysInMonth = (yearInfo & (0x8000 >> (lunarMonth - 1))) ? 30 : 29;
        
        if (offset < daysInMonth) {
            break;
        }
        
        offset -= daysInMonth;
        
        // Xử lý tháng nhuận
        if (leapMonth === lunarMonth) {
            const leapDays = (yearInfo & 0x10000) ? 30 : 29;
            if (offset < leapDays) {
                isLeap = true;
                break;
            }
            offset -= leapDays;
        }
    }
    
    const lunarDay = offset + 1;
    
    return {
        lunarDay,
        lunarMonth,
        lunarYear,
        isLeap,
        canChiYear: getCanChiYear(lunarYear),
        fullString: `Ngày ${lunarDay} tháng ${lunarMonth} năm ${getCanChiYear(lunarYear)} ${isLeap ? '(Nhuận)' : ''}`
    };
};

export const getCanChiYear = (year: number): string => {
  const canIndex = (year + 6) % 10;
  const chiIndex = (year + 8) % 12;
  return `${CAN[canIndex]} ${CHI[chiIndex]}`;
};

export const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month, 0).getDate();
};
