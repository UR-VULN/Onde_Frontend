import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import {
  get_seller_cars_inventory_api,
  groupSellerCarsByModel,
  patch_seller_inventory_day_api,
  register_seller_car_api,
  type SellerCarInventoryDto,
  type SellerCarModelGroup,
  type SellerCarRegisterPayload,
} from '@/api/sellerApi';
import { SellerMonthYearSelect } from '@/components/seller/SellerMonthYearSelect';
import { getDefaultYearMonthValue, parseYearMonthValue } from '@/utils/calendarUtils';
import { CAR_RENTAL_CITIES } from '@/constants/carRentalCities';
import {
  distributeStockAcrossVehicles,
  fetchMergedCarGroupCalendar,
} from '@/utils/sellerCarGroups';

export const SellerCarPanel: React.FC = () => {
  const { addToast } = useTravelStore();
  const [cars, setCars] = useState<SellerCarInventoryDto[]>([]);
  const [selectedGroupKey, setSelectedGroupKey] = useState('');

  const carGroups = useMemo(() => groupSellerCarsByModel(cars), [cars]);
  const selectedGroup = useMemo(
    () => carGroups.find((g) => g.groupKey === selectedGroupKey) ?? null,
    [carGroups, selectedGroupKey]
  );
  const [yearMonth, setYearMonth] = useState(getDefaultYearMonthValue);
  const { year, month } = parseYearMonthValue(yearMonth);
  const [dailyData, setDailyData] = useState<Record<number, { stock: number; price: number; isClosed?: boolean }>>({});
  const [overrideTarget, setOverrideTarget] = useState<{ day: number; stock: number; price: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerSubmitting, setRegisterSubmitting] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [registerForm, setRegisterForm] = useState<SellerCarRegisterPayload>({
    licensePlate: '',
    modelName: '',
    carType: 'SUV',
    dailyPrice: 75000,
    location: '제주',
  });

  const reset_register_form = () => {
    setRegisterForm({
      licensePlate: '',
      modelName: '',
      carType: 'SUV',
      dailyPrice: 75000,
      location: '제주',
    });
    setThumbnailFile(null);
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setThumbnailPreview(null);
  };

  const loadInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await get_seller_cars_inventory_api();
      if (res.success && res.data) {
        setCars(res.data);
        const groups = groupSellerCarsByModel(res.data);
        if (groups[0]) {
          setSelectedGroupKey(groups[0].groupKey);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCalendar = useCallback(async (group: SellerCarModelGroup, y: number, m: number) => {
    const monthStr = `${y}-${String(m).padStart(2, '0')}`;
    const mapped = await fetchMergedCarGroupCalendar(group, monthStr);
    setDailyData(mapped);
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  useEffect(() => {
    if (selectedGroup) {
      loadCalendar(selectedGroup, year, month);
    }
  }, [selectedGroup, year, month, loadCalendar]);

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
    if (!registerForm.licensePlate.trim() || !registerForm.modelName.trim()) {
      addToast('차량 번호와 모델명은 필수입니다.', 'warning');
      return;
    }

    setRegisterSubmitting(true);
    try {
      const res = await register_seller_car_api({
        ...registerForm,
        thumbnailFile,
      });
      if (res.success) {
        addToast(res.message || '렌터카 등록 신청이 완료되었습니다. 관리자 승인 후 노출됩니다.', 'success');
        setIsRegisterOpen(false);
        reset_register_form();
        await loadInventory();
        return;
      }
      addToast(res.message || '렌터카 등록에 실패했습니다.', 'warning');
    } catch (err: unknown) {
      const msg =
        (err as { error?: { systemMessage?: string; message?: string } })?.error?.systemMessage ||
        (err as { error?: { message?: string } })?.error?.message ||
        (err as { message?: string })?.message ||
        '렌터카 등록 중 오류가 발생했습니다.';
      addToast(msg, 'warning');
    } finally {
      setRegisterSubmitting(false);
    }
  };

  const handle_override_save = async (day: number, stock: number, price: number) => {
    if (!selectedGroup) return;

    try {
      const monthStr = `${year}-${String(month).padStart(2, '0')}`;
      const perVehicleStocks = distributeStockAcrossVehicles(stock, selectedGroup.vehicleCount);
      const results = await Promise.all(
        selectedGroup.vehicles.map((vehicle, index) =>
          patch_seller_inventory_day_api({
            propertyKey: `car-${vehicle.propertyId}`,
            day,
            stock: perVehicleStocks[index] ?? 0,
            price,
            month: monthStr,
          })
        )
      );

      if (results.every((r) => r.success)) {
        setDailyData((prev) => ({ ...prev, [day]: { stock, price, isClosed: stock === 0 } }));
        addToast(`${selectedGroup.modelName} · ${day}일 설정이 반영되었습니다.`, 'success');
        setOverrideTarget(null);
        return;
      }
      addToast(results.find((r) => !r.success)?.message || `${day}일 설정 반영에 실패했습니다.`, 'warning');
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ||
        (err as { error?: { message?: string } })?.error?.message ||
        `${day}일 설정을 반영하는 도중 오류가 발생했습니다.`;
      addToast(msg, 'warning');
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
          onClick={() =>
            setOverrideTarget({
              day,
              stock: data?.stock ?? selectedGroup?.vehicleCount ?? 1,
              price: data?.price ?? selectedGroup?.basePrice ?? 75000,
            })
          }
        >
          <span className="calendar-cell-date">{day}</span>
          {data ? (
            <div className="calendar-cell-data flex flex-col gap-0.5 mt-1">
              {data.isClosed ? (
                <span className="text-rose-500 font-black">마감</span>
              ) : (
                <>
                  <span className="text-emerald-600">{data.stock}대 잔여</span>
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
          <h2 className="section-title">렌터카 재고 관리</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            등록하신 차량의 일자별 대여 수량과 요금을 조절합니다.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          style={{ flexShrink: 0 }}
          onClick={() => setIsRegisterOpen(true)}
        >
          <i className="fa-solid fa-plus"></i> 렌터카 등록
        </button>
      </div>

      {loading ? (
        <p className="text-center text-slate-500 font-bold py-12">차량 목록을 로딩하는 중...</p>
      ) : (
        <div className="data-table-container" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h4 style={{ fontWeight: 700, color: '#008a05', marginBottom: '1.2rem' }}>
            <i className="fa-solid fa-car-side"></i> 렌터카 보유 현황
          </h4>
          <div className="seller-inventory-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>차량 모델명</th>
                  <th className="text-center">보유 수량</th>
                  <th className="text-right">기본 일일 대여 요금</th>
                </tr>
              </thead>
              <tbody>
                {carGroups.map((group) => (
                  <tr key={group.groupKey}>
                    <td className="font-bold text-slate-700">
                      {group.modelName}
                      {group.vehicleCount > 1 && (
                        <span
                          className="block text-[0.72rem] font-semibold text-slate-400 mt-0.5"
                        >
                          {group.vehicleCount}대 등록
                        </span>
                      )}
                    </td>
                    <td className="text-center font-bold text-slate-500">{group.vehicleCount}대</td>
                    <td className="font-black text-slate-900 text-right">
                      {group.minPrice === group.maxPrice
                        ? `₩${group.basePrice.toLocaleString()}`
                        : `₩${group.minPrice.toLocaleString()} ~ ₩${group.maxPrice.toLocaleString()}`}
                    </td>
                  </tr>
                ))}
                {carGroups.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-slate-400">
                      등록된 렌터카 상품이 없습니다.
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
            <i className="fa-solid fa-calendar-check" style={{ color: 'var(--primary)' }}></i> 일자별 보유 대수 및 요금 제어
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
              value={selectedGroupKey}
              onChange={(e) => setSelectedGroupKey(e.target.value)}
              className="form-input"
              style={{ width: '280px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
              disabled={carGroups.length === 0}
            >
              {carGroups.length === 0 ? (
                <option value="">등록된 렌터카 없음</option>
              ) : (
                carGroups.map((group) => (
                  <option key={group.groupKey} value={group.groupKey}>
                    {group.modelName}
                    {group.vehicleCount > 1 ? ` (${group.vehicleCount}대)` : ''}
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
          <div className="app-modal" style={{ width: '520px', maxWidth: '96%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                <i className="fa-solid fa-car-side" style={{ color: '#008a05' }}></i> 렌터카 신규 등록
              </h3>
              <button type="button" onClick={() => setIsRegisterOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handle_register_submit}>
              <div className="form-group">
                <label className="form-label">차량 번호 *</label>
                <input
                  className="form-input"
                  value={registerForm.licensePlate}
                  onChange={(e) => setRegisterForm((prev) => ({ ...prev, licensePlate: e.target.value }))}
                  placeholder="12가 3456"
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">모델명 *</label>
                  <input
                    className="form-input"
                    value={registerForm.modelName}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, modelName: e.target.value }))}
                    placeholder="예: 현대 아이오닉 5"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">차종</label>
                  <select
                    className="form-input"
                    value={registerForm.carType}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, carType: e.target.value }))}
                  >
                    <option value="SUV">SUV</option>
                    <option value="승용">승용</option>
                    <option value="전기">전기</option>
                    <option value="밴">밴</option>
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
                  {CAR_RENTAL_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">기본 일일 대여 요금 (원)</label>
                <input
                  type="number"
                  min={10000}
                  step={1000}
                  className="form-input"
                  value={registerForm.dailyPrice}
                  onChange={(e) => setRegisterForm((prev) => ({ ...prev, dailyPrice: Number(e.target.value) }))}
                />
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
                    alt="차량 미리보기"
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

              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                등록 후 관리자 승인(PENDING)을 거쳐 고객 화면에 노출됩니다.
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
          <label className="form-label">차종 전체 잔여 대수 (합산): {stock}대</label>
          <input
            type="range"
            min={0}
            max={30}
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
