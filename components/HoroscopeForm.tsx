
import React, { useState } from 'react';
import { UserProfile } from '../types';
import DatePicker from './DatePicker';

interface HoroscopeFormProps {
  onSubmit: (user: UserProfile) => void;
  isLoading: boolean;
}

const HoroscopeForm: React.FC<HoroscopeFormProps> = ({ onSubmit, isLoading }) => {
  const [name, setName] = useState('');
  // Default to a common birth year for better UX
  const [date, setDate] = useState('1990-01-01');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && date) {
      const [yearStr, monthStr, dayStr] = date.split('-');
      const birthYear = parseInt(yearStr);
      const birthMonth = parseInt(monthStr);
      const birthDay = parseInt(dayStr);

      const userProfile: UserProfile = {
        name,
        birthDate: date,
        gender,
        birthDay,
        birthMonth,
        birthYear,
        calendarType: 'solar',
        birthTimeStr: '12:00', // Default
        viewYear: 2026, // Default
        viewMonth: 1 // Default
      };

      onSubmit(userProfile);
    }
  };

  return (
    <div className="max-w-xl mx-auto glass-card p-6 md:p-10 rounded-2xl animate-fade-in-up">
      <div className="text-center mb-6 md:mb-8">
        <h3 className="text-xl md:text-2xl font-serif text-white mb-2">Thông Tin Gia Chủ</h3>
        <p className="text-brand-muted text-sm">Vui lòng cung cấp thông tin chính xác để AI thiết lập lá số.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
        <div className="space-y-1">
          <label className="text-xs uppercase font-bold text-brand-muted tracking-wider ml-1">Họ và Tên</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full input-premium rounded-lg px-4 py-3.5 text-base md:text-sm text-white placeholder-brand-muted/50"
            placeholder="Nhập họ tên đầy đủ"
          />
        </div>

        <div className="space-y-1">
          <DatePicker 
            label="Ngày Tháng Năm Sinh (Dương Lịch)" 
            value={date} 
            onChange={setDate} 
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase font-bold text-brand-muted tracking-wider ml-1">Giới Tính</label>
          <div className="flex bg-brand-dark/40 p-1 rounded-lg border border-white/5">
            <button
              type="button"
              onClick={() => setGender('male')}
              className={`flex-1 py-3 md:py-2.5 rounded-md text-sm font-medium transition-all ${
                gender === 'male'
                  ? 'bg-brand-secondary text-white shadow-sm border border-white/10'
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              Nam
            </button>
            <button
              type="button"
              onClick={() => setGender('female')}
              className={`flex-1 py-3 md:py-2.5 rounded-md text-sm font-medium transition-all ${
                gender === 'female'
                  ? 'bg-brand-secondary text-white shadow-sm border border-white/10'
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              Nữ
            </button>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-gold py-4 rounded-lg text-brand-dark font-bold uppercase tracking-widest text-sm disabled:opacity-70 disabled:cursor-not-allowed touch-manipulation"
          >
            {isLoading ? 'Đang Khởi Tạo...' : 'Lập Lá Số & Luận Giải'}
          </button>
          <p className="text-center text-xs text-brand-muted mt-4">
            Bằng việc tiếp tục, bạn đồng ý với điều khoản dịch vụ của chúng tôi.
          </p>
        </div>
      </form>
    </div>
  );
};

export default HoroscopeForm;
