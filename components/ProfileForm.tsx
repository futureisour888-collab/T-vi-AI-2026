
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Sparkles, Calendar, Clock, User, Zap } from 'lucide-react';
import { convertSolarToLunar } from '../utils/dateUtils';

interface ProfileFormProps {
  onSubmit: (profile: UserProfile) => void;
}

const TEST_PROFILES = [
  { name: "Nguyễn Văn An", d: 15, m: 5, y: 1990, g: 'male', h: 9, min: 30 },      // Canh Ngọ
  { name: "Trần Thị Bích", d: 22, m: 8, y: 1995, g: 'female', h: 14, min: 15 },   // Ất Hợi
  { name: "Lê Văn Cường", d: 10, m: 2, y: 1985, g: 'male', h: 7, min: 0 },        // Ất Sửu
  { name: "Phạm Thị Dung", d: 5, m: 11, y: 2000, g: 'female', h: 19, min: 45 },   // Canh Thìn
  { name: "Hoàng Văn Em", d: 30, m: 4, y: 1998, g: 'male', h: 23, min: 15 },      // Mậu Dần
  { name: "Vũ Thị Mai", d: 12, m: 9, y: 1992, g: 'female', h: 5, min: 30 },       // Nhâm Thân
  { name: "Đặng Văn Hùng", d: 18, m: 1, y: 1980, g: 'male', h: 11, min: 0 },      // Canh Thân
  { name: "Bùi Thị Lan", d: 25, m: 12, y: 1988, g: 'female', h: 16, min: 20 },    // Mậu Thìn
  { name: "Ngô Văn Nam", d: 8, m: 6, y: 2002, g: 'male', h: 13, min: 10 },        // Nhâm Ngọ
  { name: "Đỗ Thị Hương", d: 14, m: 3, y: 1975, g: 'female', h: 8, min: 50 }      // Ất Mão
];

const ProfileForm: React.FC<ProfileFormProps> = ({ onSubmit }) => {
  // Form State
  const [name, setName] = useState('');
  
  // Date State
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(1995);
  const [lunarDateStr, setLunarDateStr] = useState('');
  
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
  
  // Dev mode toggle
  const [showTestProfiles, setShowTestProfiles] = useState(false);

  // Helper arrays
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i + 1); // Future proof slightly
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  useEffect(() => {
    try {
        const lunar = convertSolarToLunar(day, month, year);
        setLunarDateStr(lunar.fullString);
    } catch (e) {
        console.error("Date conversion error", e);
        setLunarDateStr('');
    }
  }, [day, month, year]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processSubmit(name, day, month, year, birthHour, birthMinute, gender);
  };

  const processSubmit = (
    n: string, d: number, m: number, y: number, 
    h: number, min: number, g: 'male' | 'female'
  ) => {
    if (!n.trim()) return;

    // Create Date string YYYY-MM-DD for API consistency
    const birthDateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const birthTimeStr = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;

    const profile: UserProfile = {
      name: n,
      birthDay: d,
      birthMonth: m,
      birthYear: y,
      birthDate: birthDateStr,
      calendarType: 'solar', // Assume solar for test profiles
      birthTimeStr,
      gender: g,
      viewYear: 2026,
      viewMonth: 1
    };

    onSubmit(profile);
  };

  const applyTestProfile = (p: typeof TEST_PROFILES[0]) => {
     setName(p.name);
     setDay(p.d);
     setMonth(p.m);
     setYear(p.y);
     setGender(p.g as 'male' | 'female');
     setBirthHour(p.h);
     setBirthMinute(p.min);
     
     // Auto submit
     processSubmit(p.name, p.d, p.m, p.y, p.h, p.min, p.g as 'male' | 'female');
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
                    <label className="text-xs font-bold text-brand-muted uppercase tracking-wider ml-1">Ngày sinh (Dương lịch)</label>
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
                    {/* Lunar Date Display */}
                    {lunarDateStr && (
                        <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-brand-accent/10 border border-brand-accent/20 rounded-md">
                            <Calendar size={14} className="text-brand-accent shrink-0" />
                            <span className="text-xs font-medium text-brand-accent">
                                Âm lịch: {lunarDateStr}
                            </span>
                        </div>
                    )}
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

            {/* QUICK TEST SECTION */}
            <div className="mt-8 border-t border-white/10 pt-4">
                <button 
                    onClick={() => setShowTestProfiles(!showTestProfiles)}
                    className="flex items-center gap-2 text-xs font-bold text-brand-muted uppercase hover:text-brand-accent transition-colors mb-4"
                >
                    <Zap size={12} className={showTestProfiles ? "text-brand-accent" : ""} /> 
                    {showTestProfiles ? "Ẩn Test Mode" : "Mở Test Mode (1-Click Login)"}
                </button>
                
                {showTestProfiles && (
                    <div className="grid grid-cols-2 gap-2 animate-fade-in">
                        {TEST_PROFILES.map((p, i) => (
                            <button
                                key={i}
                                onClick={() => applyTestProfile(p)}
                                className="text-[10px] bg-brand-secondary/50 hover:bg-brand-secondary border border-white/5 hover:border-brand-accent/30 rounded p-2 text-left transition-all truncate"
                            >
                                <span className="font-bold text-white block">{p.name}</span>
                                <span className="text-brand-muted">{p.y} - {p.g === 'male' ? 'Nam' : 'Nữ'}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default ProfileForm;
