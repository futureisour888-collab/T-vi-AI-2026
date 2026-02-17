
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Sparkles, Calendar, Clock, User } from 'lucide-react';

interface ProfileFormProps {
  onSubmit: (profile: UserProfile) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onSubmit }) => {
  // Form State
  const [name, setName] = useState('');
  
  // Date State
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(1995);
  
  // Options
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar');
  
  // Time State
  const [timezone, setTimezone] = useState('GMT+7');
  const [birthHour, setBirthHour] = useState(12);
  const [birthMinute, setBirthMinute] = useState(30);
  
  // Gender State
  const [gender, setGender] = useState<'male' | 'female'>('male');
  
  // View Time State
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(1);

  // Helper arrays
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i + 1); // Future proof slightly
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Create Date string YYYY-MM-DD for API consistency
    const birthDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const birthTimeStr = `${String(birthHour).padStart(2, '0')}:${String(birthMinute).padStart(2, '0')}`;

    const profile: UserProfile = {
      name,
      birthDay: day,
      birthMonth: month,
      birthYear: year,
      birthDate: birthDateStr,
      calendarType,
      birthTimeStr,
      gender,
      viewYear,
      viewMonth
    };

    onSubmit(profile);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-premium-gradient">
        {/* Intro Header */}
        <div className="text-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-accent to-yellow-600 shadow-glow mb-4">
               <Sparkles size={32} className="text-brand-dark" />
            </div>
            <h1 className="text-2xl md:text-4xl font-serif font-bold text-white mb-2">
               Hồ Sơ <span className="text-brand-accent">Tín Chủ</span>
            </h1>
            <p className="text-brand-muted text-sm md:text-base max-w-md mx-auto">
               Nhập thông tin một lần để kích hoạt tất cả các tính năng dự đoán Vận Mệnh 2026.
            </p>
        </div>

        {/* The Form Card */}
        <div className="w-full max-w-lg glass-card rounded-2xl p-6 md:p-8 animate-fade-in-up delay-100 shadow-2xl border border-white/10">
            <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* 1. Họ Tên */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-muted uppercase tracking-wider ml-1">Họ Tên</label>
                    <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nhập họ tên..."
                        className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 focus:outline-none placeholder-gray-400 font-medium"
                    />
                </div>

                {/* 2. Ngày Sinh Row */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-muted uppercase tracking-wider ml-1">Ngày sinh</label>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="relative">
                            <select 
                                value={day} 
                                onChange={(e) => setDay(Number(e.target.value))}
                                className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2.5 text-sm appearance-none focus:outline-none focus:border-brand-accent"
                            >
                                {days.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none">▼</span>
                        </div>
                        <div className="relative">
                            <select 
                                value={month} 
                                onChange={(e) => setMonth(Number(e.target.value))}
                                className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2.5 text-sm appearance-none focus:outline-none focus:border-brand-accent"
                            >
                                {months.map(m => <option key={m} value={m}>Tháng {m}</option>)}
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none">▼</span>
                        </div>
                        <div className="relative">
                             <input 
                                type="number" 
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                                className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:border-brand-accent focus:outline-none"
                             />
                        </div>
                    </div>
                </div>

                {/* 3. Lịch Âm/Dương Radio */}
                <div className="flex gap-6 pl-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${calendarType === 'solar' ? 'border-blue-500' : 'border-gray-400'}`}>
                            {calendarType === 'solar' && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                        </div>
                        <input type="radio" className="hidden" name="calendar" checked={calendarType === 'solar'} onChange={() => setCalendarType('solar')} />
                        <span className={`text-sm ${calendarType === 'solar' ? 'text-white font-medium' : 'text-brand-muted'}`}>Lịch dương</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${calendarType === 'lunar' ? 'border-blue-500' : 'border-gray-400'}`}>
                            {calendarType === 'lunar' && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                        </div>
                        <input type="radio" className="hidden" name="calendar" checked={calendarType === 'lunar'} onChange={() => setCalendarType('lunar')} />
                        <span className={`text-sm ${calendarType === 'lunar' ? 'text-white font-medium' : 'text-brand-muted'}`}>Lịch âm</span>
                    </label>
                </div>

                {/* 4. Giờ Sinh */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-muted uppercase tracking-wider ml-1">Giờ sinh</label>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="relative">
                             <div className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2.5 text-sm flex items-center justify-between">
                                <span>GMT +7</span>
                                <span className="text-gray-500 text-xs">▼</span>
                             </div>
                        </div>
                        <div className="relative">
                            <select 
                                value={birthHour} 
                                onChange={(e) => setBirthHour(Number(e.target.value))}
                                className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2.5 text-sm appearance-none focus:outline-none focus:border-brand-accent"
                            >
                                {hours.map(h => <option key={h} value={h}>{h} Giờ</option>)}
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none">▼</span>
                        </div>
                        <div className="relative">
                            <select 
                                value={birthMinute} 
                                onChange={(e) => setBirthMinute(Number(e.target.value))}
                                className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2.5 text-sm appearance-none focus:outline-none focus:border-brand-accent"
                            >
                                {minutes.map(m => <option key={m} value={m}>{m} Phút</option>)}
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none">▼</span>
                        </div>
                    </div>
                </div>

                {/* 5. Giới tính */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-muted uppercase tracking-wider ml-1">Giới tính</label>
                    <div className="flex gap-6 pl-1 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${gender === 'male' ? 'border-blue-500' : 'border-gray-400'}`}>
                                {gender === 'male' && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                            </div>
                            <input type="radio" className="hidden" name="gender" checked={gender === 'male'} onChange={() => setGender('male')} />
                            <span className={`text-sm ${gender === 'male' ? 'text-white font-medium' : 'text-brand-muted'}`}>Nam</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${gender === 'female' ? 'border-blue-500' : 'border-gray-400'}`}>
                                {gender === 'female' && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                            </div>
                            <input type="radio" className="hidden" name="gender" checked={gender === 'female'} onChange={() => setGender('female')} />
                            <span className={`text-sm ${gender === 'female' ? 'text-white font-medium' : 'text-brand-muted'}`}>Nữ</span>
                        </label>
                    </div>
                </div>

                {/* 6. Năm xem / Tháng xem */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-brand-muted uppercase tracking-wider ml-1">Năm xem</label>
                        <input 
                            type="number" 
                            value={viewYear}
                            onChange={(e) => setViewYear(Number(e.target.value))}
                            className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:border-brand-accent focus:outline-none"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-brand-muted uppercase tracking-wider ml-1">Tháng xem (Âm lịch)</label>
                        <div className="relative">
                            <select 
                                value={viewMonth} 
                                onChange={(e) => setViewMonth(Number(e.target.value))}
                                className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2.5 text-sm appearance-none focus:outline-none focus:border-brand-accent"
                            >
                                {months.map(m => <option key={m} value={m}>Tháng {m}</option>)}
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none">▼</span>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full btn-gold py-3.5 rounded-lg text-brand-dark font-bold uppercase tracking-widest text-sm shadow-lg hover:shadow-xl transition-all transform active:scale-95"
                    >
                        Khởi Tạo Lá Số
                    </button>
                </div>

            </form>
        </div>
    </div>
  );
};

export default ProfileForm;
