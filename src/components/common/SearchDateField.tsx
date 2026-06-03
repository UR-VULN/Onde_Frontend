import React, { useRef } from 'react';

interface SearchDateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  disabled?: boolean;
  disabledContent?: React.ReactNode;
  required?: boolean;
  className?: string;
}

export const SearchDateField: React.FC<SearchDateFieldProps> = ({
  label,
  value,
  onChange,
  min,
  disabled = false,
  disabledContent,
  required = true,
  className = 'flex-1 min-w-[125px]',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    if (disabled) return;
    const input = inputRef.current;
    if (!input) return;
    if (typeof input.showPicker === 'function') {
      try {
        input.showPicker();
        return;
      } catch {
        // showPicker can throw if not triggered by user gesture
      }
    }
    input.focus();
  };

  return (
    <div
      className={`${className} flex flex-col justify-center items-center text-center py-2 px-3 relative ${
        disabled ? 'bg-slate-100/40 opacity-40 cursor-not-allowed' : 'cursor-pointer'
      }`}
      onClick={openPicker}
    >
      <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block pointer-events-none">
        {label}
      </span>
      {disabled ? (
        disabledContent ?? (
          <div className="flex items-center justify-center text-base font-extrabold text-slate-400 select-none pointer-events-none">
            <i className="fa-regular fa-calendar text-slate-300 text-sm mr-2"></i>
            <span>-</span>
          </div>
        )
      ) : (
        <div className="flex items-center justify-center text-base font-extrabold text-slate-800 w-full pointer-events-none">
          <i className="fa-regular fa-calendar text-slate-400 text-sm mr-2"></i>
          <span>{value}</span>
        </div>
      )}
      {!disabled && (
        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          className="absolute inset-0 z-10 w-full h-full cursor-pointer opacity-[0.01]"
          style={{ colorScheme: 'light' }}
          required={required}
          aria-label={label}
        />
      )}
    </div>
  );
};
