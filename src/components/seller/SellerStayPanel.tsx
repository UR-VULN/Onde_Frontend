import React, { useCallback, useEffect, useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import {
  get_seller_accommodations_api,
  get_seller_inventory_calendar_api,
  patch_seller_inventory_day_api,
  type SellerPropertyDto,
} from '@/api/sellerApi';
import { SellerMonthYearSelect } from '@/components/seller/SellerMonthYearSelect';
import { getDefaultYearMonthValue, parseYearMonthValue } from '@/utils/calendarUtils';

export const SellerStayPanel: React.FC = () => {
  const { addToast } = useTravelStore();
  const [stays, setStays] = useState<SellerPropertyDto[]>([]);
  const [selectedPropertyKey, setSelectedPropertyKey] = useState('');
  const [yearMonth, setYearMonth] = useState(getDefaultYearMonthValue);
  const { year, month } = parseYearMonthValue(yearMonth);
  const [dailyData, setDailyData] = useState<Record<number, { stock: number; price: number; isClosed?: boolean }>>({});
  const [overrideTarget, setOverrideTarget] = useState<{ day: number; stock: number; price: number } | null>(null);
  const [loading, setLoading] = useState(true);

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
                    <td colSpan={3} className="text-center py-4 text-slate-400">등록된 숙소 상품이 없습니다.</td>
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
            onChange={(e) => setStock(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">하루당 요금 (KRW)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="form-input"
          />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" onClick={() => onSave(stock, price)} className="btn-primary" style={{ flex: 1 }}>
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
