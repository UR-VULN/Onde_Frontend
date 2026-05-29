import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface SearchListPickerProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  iconClass?: string;
  panelTitle?: string;
  panelSubtitle?: string;
  listLabel?: string;
  panelWidth?: number;
}

interface PanelPosition {
  top: number;
  left: number;
  width: number;
}

const DEFAULT_PANEL_WIDTH = 360;
const PANEL_GAP = 8;
const VIEWPORT_PADDING = 16;

function clampPanelPosition(triggerRect: DOMRect, panelWidth: number): PanelPosition {
  const width = Math.min(panelWidth, window.innerWidth - VIEWPORT_PADDING * 2);
  const idealLeft = triggerRect.left + triggerRect.width / 2 - width / 2;
  const left = Math.max(
    VIEWPORT_PADDING,
    Math.min(idealLeft, window.innerWidth - width - VIEWPORT_PADDING)
  );

  return {
    top: triggerRect.bottom + PANEL_GAP,
    left,
    width,
  };
}

export const SearchListPicker: React.FC<SearchListPickerProps> = ({
  label,
  value,
  options,
  onChange,
  iconClass = 'fa-solid fa-location-dot text-[#005ce6]',
  panelTitle = '선택해 주세요',
  panelSubtitle = '항목을 선택하세요',
  listLabel = '목록',
  panelWidth = DEFAULT_PANEL_WIDTH,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [panelPos, setPanelPos] = useState<PanelPosition | null>(null);

  const updatePanelPosition = useCallback(() => {
    if (!triggerRef.current) return;
    setPanelPos(clampPanelPosition(triggerRef.current.getBoundingClientRect(), panelWidth));
  }, [panelWidth]);

  useEffect(() => {
    if (!open) return;
    updatePanelPosition();
  }, [open, updatePanelPosition]);

  useEffect(() => {
    if (!open) return;

    const handleReposition = () => updatePanelPosition();
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [open, updatePanelPosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setOpen(false);
  };

  const dropdownPanel = open && panelPos
    ? createPortal(
        <div
          ref={panelRef}
          className="fixed z-[9999]"
          style={{ top: panelPos.top, left: panelPos.left, width: panelPos.width }}
        >
          <div className="destination-picker-panel rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.18)] overflow-hidden">
            <div
              className="h-1 w-full"
              style={{ background: 'linear-gradient(135deg, #005ce6 0%, #ff5a5f 100%)' }}
            />

            <div className="destination-picker-panel__head">
              <p className="destination-picker-panel__head-title">{panelTitle}</p>
              <p className="destination-picker-panel__head-sub">{panelSubtitle}</p>
            </div>

            <div className="destination-picker-panel__body">
              <div className="destination-picker-panel__columns destination-picker-panel__columns--single">
                <div className="destination-picker-panel__country-card">
                  <div className="destination-picker-panel__section-head">
                    <span className="destination-picker-panel__section-label">{listLabel}</span>
                  </div>
                  <div className="destination-picker-panel__scroll">
                    <ul className="destination-picker-panel__country-list">
                      {options.map((option) => {
                        const isSelected = value === option;

                        return (
                          <li key={option}>
                            <button
                              type="button"
                              onClick={() => handleSelect(option)}
                              className={`destination-picker-panel__country-btn${
                                isSelected ? ' is-active' : ''
                              }`}
                            >
                              <div style={{ minWidth: 0 }}>
                                <span className="destination-picker-panel__country-name">
                                  {option}
                                </span>
                              </div>
                              {isSelected && (
                                <i className="fa-solid fa-check text-[10px] text-[#ff5a5f] shrink-0"></i>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div ref={rootRef} className={`flex-1 min-w-0 relative z-10 ${open ? 'z-[9998]' : ''}`}>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={`w-full h-full min-h-[64px] lg:min-h-[68px] flex flex-col justify-center items-center text-center py-2 px-3 cursor-pointer transition-colors duration-200 ${
            open ? 'bg-white/90' : 'hover:bg-white/60'
          }`}
        >
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block pointer-events-none">
            {label}
          </span>

          <div className="inline-flex items-center justify-center gap-2 max-w-full text-base font-extrabold text-slate-800 pointer-events-none">
            <i className={`${iconClass} text-sm shrink-0`}></i>
            <span className="truncate">{value}</span>
            <i
              className={`fa-solid fa-chevron-down text-[10px] text-slate-400 shrink-0 transition-transform duration-200 ${
                open ? 'rotate-180 text-[#005ce6]' : ''
              }`}
            ></i>
          </div>
        </button>
      </div>
      {dropdownPanel}
    </>
  );
};
