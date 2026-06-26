import React, { useCallback, useEffect, useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import {
  get_seller_accommodations_api,
  get_seller_inventory_calendar_api,
  patch_seller_inventory_day_api,
  register_seller_accommodation_api,
  type SellerAccommodationRegisterPayload,
  type SellerPropertyDto,
} from '@/api/sellerApi';
import { SellerMonthYearSelect } from '@/components/seller/SellerMonthYearSelect';
import { getDefaultYearMonthValue, parseYearMonthValue } from '@/utils/calendarUtils';
import { extractApiErrorMessage } from '@/utils/apiResponse';
import { TRAVEL_DESTINATIONS } from '@/constants/travelDestinations';

const STAY_LOCATION_OPTIONS = TRAVEL_DESTINATIONS.flatMap((c) =>
  c.cities.map((city) => ({
    label: `${city} (${c.label})`,
    value: `${city}, ${c.value}`,
  }))
).sort((a, b) => a.label.localeCompare(b.label, 'ko'));

export const SellerStayPanel: React.FC = () => {
  const { addToast } = useTravelStore();
  const [stays, setStays] = useState<SellerPropertyDto[]>([]);
  const [selectedPropertyKey, setSelectedPropertyKey] = useState('');
  const [yearMonth, setYearMonth] = useState(getDefaultYearMonthValue);
  const { year, month } = parseYearMonthValue(yearMonth);
  const [dailyData, setDailyData] = useState<Record<number, { stock: number; price: number; isClosed?: boolean }>>({});
  const [overrideTarget, setOverrideTarget] = useState<{ day: number; stock: number; price: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerSubmitting, setRegisterSubmitting] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [registerForm, setRegisterForm] = useState<SellerAccommodationRegisterPayload>({
    name: '',
    description: '',
    category: '호텔',
    location: '',
    businessLicense: 'LIC-00000',
    latitude: undefined,
    longitude: undefined,
    rooms: [{ name: '', capacity: 2, baseCapacity: 2, extraPersonFee: 20000 }],
  });

  const reset_register_form = () => {
    setRegisterForm({
      name: '',
      description: '',
      category: '호텔',
      location: '',
      businessLicense: 'LIC-00000',
      latitude: undefined,
      longitude: undefined,
      rooms: [{ name: '', capacity: 2, baseCapacity: 2, extraPersonFee: 20000 }],
    });
    setThumbnailFile(null);
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setThumbnailPreview(null);
  };

  const has_coordinate_precision = (value: number) => {
    const decimal = String(value).split('.')[1];
    return decimal != null && decimal.length >= 4;
  };

  const loadInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await get_seller_accommodations_api();
      if (res.success && res.data) {
        setStays(res.data);
        if (res.data[0]) {
          setSelectedPropertyKey(`stay-${res.data[0].propertyId}`);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCalendar = useCallback(async (propertyKey: string, y: number, m: number) => {
    const monthStr = `${y}-${String(m).padStart(2, '0')}`;
    const res = await get_seller_inventory_calendar_api({ propertyKey, month: monthStr });
    if (res.success && res.data) {
      const mapped: Record<number, { stock: number; price: number; isClosed?: boolean }> = {};
      Object.entries(res.data).forEach(([day, cell]) => {
        mapped[Number(day)] = {
          stock: cell.stock,
          price: cell.price,
          isClosed: cell.isClosed,
        };
      });
      setDailyData(mapped);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  useEffect(() => {
    if (selectedPropertyKey) {
      loadCalendar(selectedPropertyKey, year, month);
    }
  }, [selectedPropertyKey, year, month, loadCalendar]);

  const handle_thumbnail_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setThumbnailFile(file);
    setThumbnailPreview(file ? URL.createObjectURL(file) : null);
  };

  const handle_register_submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.name.trim() || !registerForm.location.trim()) {
      addToast('숙소명과 위치는 필수입니다.', 'warning');
      return;
    }
    if (registerForm.latitude == null || registerForm.longitude == null) {
      addToast('지도 노출을 위해 위도·경도를 입력해주세요.', 'warning');
      return;
    }
    if (
      !has_coordinate_precision(registerForm.latitude) ||
      !has_coordinate_precision(registerForm.longitude)
    ) {
      addToast('위도·경도는 소수점 4자리 이상으로 입력해주세요. (예: 33.4890, 126.4983)', 'warning');
      return;
    }

    setRegisterSubmitting(true);
    try {
      const res = await register_seller_accommodation_api({
        ...registerForm,
        thumbnailFile,
      });
      if (res.success) {
        addToast(res.message || '숙소 등록 신청이 완료되었습니다. 관리자 승인 후 노출됩니다.', 'success');
        setIsRegisterOpen(false);
        reset_register_form();
        await loadInventory();
        return;
      }
      addToast(res.message || '숙소 등록에 실패했습니다.', 'warning');
    } catch (err: unknown) {
      addToast(extractApiErrorMessage(err, '숙소 등록 중 오류가 발생했습니다.'), 'warning');
    } finally {
      setRegisterSubmitting(false);
    }
  };

  const handle_override_save = async (day: number, stock: number, price: number) => {
    try {
      const monthStr = `${year}-${String(month).padStart(2, '0')}`;
      const res = await patch_seller_inventory_day_api({
        propertyKey: selectedPropertyKey,
        day,
        stock,
        price,
        month: monthStr,
      });
      if (res.success) {
        setDailyData((prev) => ({ ...prev, [day]: { stock, price, isClosed: stock === 0 } }));
        addToast(`${day}일 설정이 반영되었습니다.`, 'success');
        setOverrideTarget(null);
        return;
      }
      addToast(res.message || `${day}일 설정 반영에 실패했습니다.`, 'warning');
    } catch (err: unknown) {
      addToast(
        extractApiErrorMessage(err, `${day}일 설정을 반영하는 도중 오류가 발생했습니다.`),
        'warning',
      );
    }
  };

  const renderCalendarCells = () => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const startDayOffset = new Date(year, month - 1, 1).getDay();
    const cells = [];

    // Empty offset cells
    for (let i = 0; i < startDayOffset; i++) {
      cells.push(
        <div
          key={`empty-${i}`}
          className="calendar-cell"
          style={{ background: 'var(--bg-light)', cursor: 'default' }}
        ></div>
      );
    }

    // Days cells
    for (let day = 1; day <= daysInMonth; day++) {
      const data = dailyData[day];
      cells.push(
        <div
          key={day}
          className="calendar-cell"
          onClick={() => setOverrideTarget({ day, stock: data?.stock ?? 5, price: data?.price ?? 245000 })}
        >
          <span className="calendar-cell-date">{day}</span>
          {data ? (
            <div className="calendar-cell-data flex flex-col gap-0.5 mt-1">
              {data.isClosed ? (
                <span className="text-rose-500 font-black">마감</span>
              ) : (
                <>
                  <span className="text-emerald-600">{data.stock}개 잔여</span>
                  <span className="text-slate-900">₩{(data.price / 1000).toLocaleString()}k</span>
                </>
              )}
            </div>
          ) : (
            <span className="text-[9px] text-slate-300 font-bold">정보 없음</span>
          )}
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="seller-panel animate-[fadeIn_0.35s_ease] space-y-6">
      <div className="section-header">
        <div>
          <h2 className="section-title">숙소 재고 관리</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            등록하신 숙소의 일자별 판매 객실 수량과 가격을 조절합니다.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          style={{ flexShrink: 0 }}
          onClick={() => setIsRegisterOpen(true)}
        >
          <i className="fa-solid fa-plus"></i> 숙소 등록
        </button>
      </div>

      {loading ? (
        <p className="text-center text-slate-500 font-bold py-12">숙소 목록을 로딩하는 중...</p>
      ) : (
        <div className="data-table-container" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h4 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '1.2rem' }}>
            <i className="fa-solid fa-hotel"></i> 숙소 보유 현황
          </h4>
          <div className="seller-inventory-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>숙소명</th>
                  <th className="text-center">상태</th>
                  <th className="text-right">기본 요금</th>
                </tr>
              </thead>
              <tbody>
                {stays.map((item) => (
                  <tr key={item.propertyId}>
                    <td className="font-bold text-slate-700">{item.name}</td>
                    <td className="text-center">
                      <span className={`status-badge ${item.status === 'ACTIVE' ? 'status-active' : 'status-pending'}`}>
                        {item.status === 'ACTIVE' ? '판매중' : '대기중'}
                      </span>
                    </td>
                    <td className="font-black text-slate-900 text-right">₩{item.basePrice.toLocaleString()}</td>
                  </tr>
                ))}
                {stays.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-slate-400">
                      등록된 숙소 상품이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="data-table-container" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h4 style={{ fontWeight: 700, color: 'var(--text-dark)' }}>
            <i className="fa-solid fa-calendar-check" style={{ color: 'var(--primary)' }}></i> 일자별 객실 수량 및 요금 제어
          </h4>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <SellerMonthYearSelect
                value={yearMonth}
                onChange={setYearMonth}
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
              />
            </div>
            
            <select
              value={selectedPropertyKey}
              onChange={(e) => setSelectedPropertyKey(e.target.value)}
              className="form-input"
              style={{ width: '260px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
              disabled={stays.length === 0}
            >
              {stays.length === 0 ? (
                <option value="">등록된 숙소 없음</option>
              ) : (
                stays.map((s) => (
                  <option key={`stay-${s.propertyId}`} value={`stay-${s.propertyId}`}>
                    {s.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="calendar-grid">
          {['일', '월', '화', '수', '목', '금', '토'].map((d, idx) => (
            <div key={d} className="calendar-header-cell">
              <span style={{ color: idx === 0 ? 'var(--secondary)' : idx === 6 ? 'var(--primary)' : undefined }}>
                {d}
              </span>
            </div>
          ))}
          {renderCalendarCells()}
        </div>
      </div>

      {isRegisterOpen && (
        <div className="modal-backdrop" style={{ display: 'flex' }}>
          <div className="app-modal" style={{ width: '640px', maxWidth: '96%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                <i className="fa-solid fa-hotel" style={{ color: 'var(--primary)' }}></i> 숙소 신규 등록
              </h3>
              <button type="button" onClick={() => setIsRegisterOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handle_register_submit}>
              <div className="grid-2" style={{ marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">숙소명 *</label>
                  <input
                    className="form-input"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="예: ONDE 오션뷰 호텔"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">카테고리</label>
                  <select
                    className="form-input"
                    value={registerForm.category}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="호텔">호텔</option>
                    <option value="펜션">펜션</option>
                    <option value="리조트">리조트</option>
                    <option value="게스트하우스">게스트하우스</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">위치 *</label>
                <select
                  className="form-input"
                  value={registerForm.location}
                  onChange={(e) => setRegisterForm((prev) => ({ ...prev, location: e.target.value }))}
                  required
                >
                  <option value="">위치(도시)를 선택하세요</option>
                  {STAY_LOCATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid-2" style={{ marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">위도 *</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="form-input"
                    value={registerForm.latitude ?? ''}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({
                        ...prev,
                        latitude: e.target.value === '' ? undefined : Number(e.target.value),
                      }))
                    }
                    placeholder="33.4890"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">경도 *</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="form-input"
                    value={registerForm.longitude ?? ''}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({
                        ...prev,
                        longitude: e.target.value === '' ? undefined : Number(e.target.value),
                      }))
                    }
                    placeholder="126.4983"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">대표 사진</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-input"
                  onChange={handle_thumbnail_change}
                />
                {thumbnailPreview && (
                  <img
                    src={thumbnailPreview}
                    alt="숙소 미리보기"
                    style={{
                      marginTop: '0.75rem',
                      width: '100%',
                      maxHeight: '180px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                    }}
                  />
                )}
              </div>

              <div className="form-group">
                <label className="form-label">숙소 소개</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={registerForm.description}
                  onChange={(e) => setRegisterForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="숙소 특징과 편의시설을 입력해주세요."
                />
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                위도·경도는 지도 마커 위치에 사용됩니다. 등록 후 관리자 승인(PENDING)을 거쳐 고객 화면에 노출됩니다.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={registerSubmitting}>
                  {registerSubmitting ? '등록 중...' : '등록 신청'}
                </button>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsRegisterOpen(false)}>
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {overrideTarget && (
        <OverrideModal
          date={`${year}-${String(month).padStart(2, '0')}-${overrideTarget.day.toString().padStart(2, '0')}`}
          initialStock={overrideTarget.stock}
          initialPrice={overrideTarget.price}
          onClose={() => setOverrideTarget(null)}
          onSave={(stock, price) => handle_override_save(overrideTarget.day, stock, price)}
        />
      )}
    </div>
  );
};

interface OverrideModalProps {
  date: string;
  initialStock: number;
  initialPrice: number;
  onClose: () => void;
  onSave: (stock: number, price: number) => void;
}

const OverrideModal: React.FC<OverrideModalProps> = ({ date, initialStock, initialPrice, onClose, onSave }) => {
  const [stock, setStock] = useState(initialStock);
  const [price, setPrice] = useState(initialPrice);

  const handleSave = () => {
    const parsedStock = parseInt(String(stock), 10);
    const parsedPrice = parseInt(String(price), 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      alert('올바른 재고 수량을 입력해주세요.');
      return;
    }
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      alert('올바른 가격을 입력해주세요.');
      return;
    }
    onSave(parsedStock, parsedPrice);
  };

  return (
    <div className="modal-backdrop" style={{ display: 'flex' }}>
      <div className="app-modal" style={{ width: '420px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>실시간 재고/가격 수동 제어</h3>
          <button type="button" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <p style={{ marginBottom: '1rem', fontWeight: 700 }}>적용 일자: {date}</p>
        <div className="form-group">
          <label className="form-label">남은 방 개수: {stock}개</label>
          <input
            type="range"
            min={0}
            max={20}
            value={stock}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setStock(isNaN(val) ? 0 : val);
            }}
            style={{ width: '100%' }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">하루당 요금 (KRW)</label>
          <input
            type="number"
            value={isNaN(price) ? '' : price}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                setPrice(NaN);
              } else {
                const parsed = parseInt(val, 10);
                if (!isNaN(parsed)) setPrice(parsed);
              }
            }}
            className="form-input"
          />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" onClick={handleSave} className="btn-primary" style={{ flex: 1 }}>
            적용하기
          </button>
          <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
};
