import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  TRAVEL_DESTINATIONS,
  formatDestinationLabel,
  findCountry,
  type TravelDestinationCountry,
} from '@/constants/travelDestinations';

interface StayDestinationPickerProps {
  country: string;
  city: string;
  onChange: (country: string, city: string) => void;
}

interface PanelPosition {
  top: number;
  left: number;
  width: number;
}

const PANEL_WIDTH = 500;
const PANEL_GAP = 8;
const VIEWPORT_PADDING = 16;

function clampPanelPosition(triggerRect: DOMRect): PanelPosition {
  const width = Math.min(PANEL_WIDTH, window.innerWidth - VIEWPORT_PADDING * 2);
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

export const StayDestinationPicker: React.FC<StayDestinationPickerProps> = ({
  country,
  city,
  onChange,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeCountry, setActiveCountry] = useState(country);
  const [panelPos, setPanelPos] = useState<PanelPosition | null>(null);

  const selectedCountry = findCountry(country);
  const activeCountryData = findCountry(activeCountry) ?? selectedCountry ?? TRAVEL_DESTINATIONS[0];

  const updatePanelPosition = useCallback(() => {
    if (!triggerRef.current) return;
    setPanelPos(clampPanelPosition(triggerRef.current.getBoundingClientRect()));
  }, []);

  useEffect(() => {
    if (!open) return;
    setActiveCountry(country);
    updatePanelPosition();
  }, [open, country, updatePanelPosition]);

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

  const handleCountrySelect = (nextCountry: TravelDestinationCountry) => {
    setActiveCountry(nextCountry.value);
    if (nextCountry.cities.length === 1) {
      onChange(nextCountry.value, nextCountry.cities[0]);
      setOpen(false);
    }
  };

  const handleCitySelect = (nextCity: string) => {
    onChange(activeCountryData.value, nextCity);
    setOpen(false);
  };

  const destinationLabel = formatDestinationLabel(city, country);

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
              <p className="destination-picker-panel__head-title">어디로 떠나시나요?</p>
              <p className="destination-picker-panel__head-sub">국가와 도시를 선택하세요</p>
            </div>

            <div className="destination-picker-panel__body">
              <div className="destination-picker-panel__columns">
                <div className="destination-picker-panel__country-card">
                  <div className="destination-picker-panel__section-head">
                    <span className="destination-picker-panel__section-label">국가</span>
                  </div>
                  <div className="destination-picker-panel__scroll">
                    <ul className="destination-picker-panel__country-list">
                      {TRAVEL_DESTINATIONS.map((item) => {
                        const isActive = activeCountryData.value === item.value;
                        const isSelected = country === item.value;

                        return (
                          <li key={item.value}>
                            <button
                              type="button"
                              onClick={() => handleCountrySelect(item)}
                              className={`destination-picker-panel__country-btn${
                                isActive ? ' is-active' : ''
                              }`}
                            >
                              <div style={{ minWidth: 0 }}>
                                <span className="destination-picker-panel__country-name">
                                  {item.label}
                                </span>
                                <span className="destination-picker-panel__country-sub">
                                  {item.cities.length > 1
                                    ? `${item.cities.length}개 도시`
                                    : item.cities[0]}
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

                <div className="destination-picker-panel__city-card">
                  <div className="destination-picker-panel__section-head destination-picker-panel__section-head--row">
                    <span className="destination-picker-panel__section-label">도시</span>
                    <span className="destination-picker-panel__section-dot">·</span>
                    <span className="destination-picker-panel__section-country">
                      {activeCountryData.label}
                    </span>
                  </div>

                  <div className="destination-picker-panel__scroll">
                    <div className="destination-picker-panel__city-grid">
                      {activeCountryData.cities.map((cityName) => {
                        const isSelected = country === activeCountryData.value && city === cityName;

                        return (
                          <button
                            key={cityName}
                            type="button"
                            onClick={() => handleCitySelect(cityName)}
                            className={`destination-picker-panel__city-btn${
                              isSelected ? ' is-selected' : ''
                            }`}
                          >
                            <span className="destination-picker-panel__city-name">{cityName}</span>
                            {isSelected && (
                              <i className="fa-solid fa-check text-[10px] text-white shrink-0"></i>
                            )}
                          </button>
                        );
                      })}
                    </div>
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
      <div
        ref={rootRef}
        className={`flex-1 min-w-0 relative z-10 ${open ? 'z-[9998]' : ''}`}
      >
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
            여행 목적지
          </span>

          <div className="inline-flex items-center justify-center gap-2 max-w-full text-base font-extrabold text-slate-800 pointer-events-none">
            <i className="fa-solid fa-location-dot text-[#005ce6] text-sm shrink-0"></i>
            <span className="truncate">{destinationLabel}</span>
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
