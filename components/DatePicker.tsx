
import React, { useState, useEffect } from 'react';
import { ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import { convertSolarToLunar, getDaysInMonth } from '../utils/dateUtils';

interface DatePickerProps {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ label, value, onChange }) => {
  const [day, setDay] = useState<number>(new Date().getDate());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(1990);
  const [lunarInfo, setLunarInfo] = useState<string>('');

  // Initialize from value prop
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setDay(date.getDate());
        setMonth(date.getMonth() + 1);
        setYear(date.getFullYear());
      }
    }
  }, []);

  // Update logic when selections change
  useEffect(() => {
    // Validate day against new month/year
    const maxDays = getDaysInMonth(month, year);
    let currentDay = day;
    if (day > maxDays) {
      currentDay = maxDays;
      setDay(maxDays);
    }

    // Format for parent component: YYYY-MM-DD
    const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
    if (formattedDate !== value) {
      onChange(formattedDate);
    }

    // Calculate Lunar Info
    const lunar = convertSolarToLunar(currentDay, month, year);
    setLunarInfo(lunar.fullString);
  }, [day, month, year]);

  const years = Array.from({ length: 97 }, (_, i) => 2026 - i); // 2026 down to 1930
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: getDaysInMonth(month, year) }, (_, i) => i + 1);

  return (
    <div className="space-y-2">
      <label className="text-xs uppercase font-bold text-brand-muted tracking-wider ml-1 flex items-center gap-2">
        {label}
      </label>
      
      {/* 3 Selects Grid - Cleaner Layout */}
      <div className="grid grid-cols-3 gap-3">
        {/* Day */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-brand-muted font-medium ml-1">Ngày</label>
          <div className="relative">
            <select
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              className="w-full appearance-none bg-brand-dark/40 border border-white/10 rounded-lg pl-3 pr-8 py-2.5 text-sm text-white focus:border-brand-accent focus:outline-none transition-colors cursor-pointer"
            >
              {days.map(d => (
                <option key={d} value={d}>{String(d).padStart(2, '0')}</option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-brand-muted">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>

        {/* Month */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-brand-muted font-medium ml-1">Tháng</label>
          <div className="relative">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full appearance-none bg-brand-dark/40 border border-white/10 rounded-lg pl-3 pr-8 py-2.5 text-sm text-white focus:border-brand-accent focus:outline-none transition-colors cursor-pointer"
            >
              {months.map(m => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
              ))}
            </select>
             <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-brand-muted">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>

        {/* Year */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-brand-muted font-medium ml-1">Năm</label>
          <div className="relative">
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full appearance-none bg-brand-dark/40 border border-white/10 rounded-lg pl-3 pr-8 py-2.5 text-sm text-white focus:border-brand-accent focus:outline-none transition-colors cursor-pointer"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
             <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-brand-muted">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Lunar Calendar Display */}
      <div className="flex items-center gap-2 px-3 py-2 bg-brand-accent/5 border border-brand-accent/10 rounded-lg mt-1">
        <CalendarIcon size={14} className="text-brand-accent shrink-0" />
        <span className="text-xs text-brand-accent font-medium truncate">
          Âm Lịch: {lunarInfo}
        </span>
      </div>
    </div>
  );
};

export default DatePicker;
