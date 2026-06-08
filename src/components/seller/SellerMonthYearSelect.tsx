import React, { useMemo } from 'react';
import { buildYearMonthOptions } from '@/utils/calendarUtils';

interface SellerMonthYearSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

/** 판매자 백오피스 — 오늘 기준 ±1년 월 선택 */
export const SellerMonthYearSelect: React.FC<SellerMonthYearSelectProps> = ({
  value,
  onChange,
  className = 'form-input',
  style,
}) => {
  const options = useMemo(() => buildYearMonthOptions(1), []);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      style={style}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};
