import React, { useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';

// ─── Mock 데이터 ─────────────────────────────────────────
const MOCK_STAYS = [
  { propertyId: 1, name: '도쿄 신주쿠 펜트하우스', status: 'ACTIVE', basePrice: 245000 },
  { propertyId: 2, name: '아사쿠사 에코 료칸', status: 'PENDING', basePrice: 125000 },
];

const MOCK_CARS = [
  { propertyId: 101, name: '제네시스 G90', stock: 4, basePrice: 180000 },
  { propertyId: 102, name: '테슬라 모델 Y', stock: 12, basePrice: 120000 },
];

// ─── 컴포넌트 ─────────────────────────────────────────────
export const SellerStayCarPanel: React.FC = () => {
  const { addToast } = useTravelStore();
  const [selectedProperty, setSelectedProperty] = useState('도쿄 신주쿠 펜트하우스');
  const [overrideTarget, setOverrideTarget] = useState<{ day: number; stock: number; price: number } | null>(null);

  // 캘린더 데이터 (샘플)
  const [dailyData, setDailyData] = useState<Record<number, { stock: number; price: number; isClosed?: boolean }>>({
    24: { stock: 5, price: 245000 },
    25: { stock: 4, price: 245000 },
    26: { stock: 0, price: 0, isClosed: true },
    27: { stock: 2, price: 294000 }, // 성수기/할증
    28: { stock: 5, price: 245000 },
    29: { stock: 5, price: 294000 },
    30: { stock: 5, price: 294000 },
  });

  const handle_override_save = (day: number, stock: number, price: number) => {
    setDailyData({ ...dailyData, [day]: { stock, price, isClosed: stock === 0 } });
    setOverrideTarget(null);
    addToast(`${day}일자 재고 및 가격 설정이 저장되었습니다.`, 'success');
  };

  const renderCalendarCells = () => {
    const cells = [];
    // 5월 기준 (24일~30일 샘플)
    for (let i = 24; i <= 30; i++) {
      const data = dailyData[i];
      cells.push(
        <div 
          key={i} 
          className="calendar-cell"
          onClick={() => setOverrideTarget({ day: i, stock: data?.stock || 5, price: data?.price || 245000 })}
        >
          <span className="calendar-cell-date">{i}</span>
          {data ? (
            <div className="calendar-cell-data flex flex-col gap-0.5 mt-1">
              {data.isClosed ? (
                <span className="text-rose-500 font-black">강제 마감</span>
              ) : (
                <>
                  <span className="text-emerald-600">{data.stock}실 남음</span>
                  <span className="text-slate-900">₩{(data.price / 1000).toLocaleString()}k</span>
                </>
              )}
            </div>
          ) : (
            <span className="text-[9px] text-slate-300 font-bold">재고 없음</span>
          )}
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="seller-panel">
      {/* Header Area */}
      <div className="section-header">
        <div>
          <h2 className="section-title">숙소 및 렌터카 실시간 자산 관리</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            날짜별 객실/차량 잔여 수량 수동 마감 및 주말/성수기 요금을 관리합니다.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => addToast('[데모] 신규 숙소 객실 타입 또는 렌터카 모델 등록 신청 양식이 활성화됩니다.', 'info')}
        >
          <i className="fa-solid fa-plus"></i> 신규 상품 등록 신청
        </button>
      </div>

      {/* Asset Lists (Side by Side Grid) */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '2rem' }}>
        {/* Stays List */}
        <div className="data-table-container" style={{ padding: '1.5rem' }}>
          <h4 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-hotel"></i> 보유 숙소/객실 목록 <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem' }}>(C팀)</span>
          </h4>
          <table className="data-table">
            <thead>
              <tr>
                <th>객실 명칭</th>
                <th className="text-center">상태</th>
                <th className="text-right">기본 요금</th>
                <th className="text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_STAYS.map((item) => (
                <tr key={item.propertyId}>
                  <td className="font-bold text-slate-700">{item.name}</td>
                  <td className="text-center">
                    <span className={`status-badge ${item.status === 'ACTIVE' ? 'status-active' : 'status-pending'}`}>
                      {item.status === 'ACTIVE' ? '노출중' : '검수중'}
                    </span>
                  </td>
                  <td className="font-black text-slate-900 text-right">₩{item.basePrice.toLocaleString()}</td>
                  <td className="text-right">
                    <button
                      type="button"
                      className="btn-secondary text-[11px] py-1.5 px-3.5"
                      onClick={() => addToast(`[데모] ${item.name} 상세 편집 패널이 열립니다.`, 'info')}
                    >
                      상세편집
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cars List */}
        <div className="data-table-container" style={{ padding: '1.5rem' }}>
          <h4 style={{ fontWeight: 700, color: '#008a05', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-car-side"></i> 보유 렌터카 목록 <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem' }}>(C팀)</span>
          </h4>
          <table className="data-table">
            <thead>
              <tr>
                <th>차량 모델</th>
                <th className="text-center">재고</th>
                <th className="text-right">일일 요금</th>
                <th className="text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CARS.map((item) => (
                <tr key={item.propertyId}>
                  <td className="font-bold text-slate-700">{item.name}</td>
                  <td className="text-center font-bold text-slate-500">{item.stock}대</td>
                  <td className="font-black text-slate-900 text-right">₩{item.basePrice.toLocaleString()}</td>
                  <td className="text-right">
                    <button
                      type="button"
                      className="btn-secondary text-[11px] py-1.5 px-3.5"
                      onClick={() => addToast(`[데모] ${item.name} 상세 편집 패널이 열립니다.`, 'info')}
                    >
                      상세편집
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Calendar Control Section */}
      <div className="data-table-container" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <h4 style={{ fontWeight: 700, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-calendar-check" style={{ color: 'var(--primary)' }}></i>
            실시간 재고 및 가격 제어 <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>(달력 UI)</span>
          </h4>
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="form-input"
            style={{ width: '220px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
          >
            <option>도쿄 신주쿠 펜트하우스</option>
            <option>아사쿠사 에코 료칸</option>
            <option>제네시스 G90</option>
            <option>테슬라 모델 Y</option>
          </select>
        </div>

        <div className="calendar-grid">
          {['일', '월', '화', '수', '목', '금', '토'].map((d, idx) => (
            <div key={d} className="calendar-header-cell">
              <span style={{ color: idx === 0 ? 'var(--secondary)' : idx === 6 ? 'var(--primary)' : undefined }}>{d}</span>
            </div>
          ))}
          {renderCalendarCells()}
        </div>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-circle-info" style={{ color: 'var(--primary)' }}></i>
            날짜 셀을 클릭하면 해당 일자의 재고와 요금을 직접 제어할 수 있습니다.
          </p>
        </div>
      </div>

      {/* Override Modal */}
      {overrideTarget && (
        <OverrideModal
          date={`2026-05-${overrideTarget.day.toString().padStart(2, '0')}`}
          initialStock={overrideTarget.stock}
          initialPrice={overrideTarget.price}
          onClose={() => setOverrideTarget(null)}
          onSave={(stock, price) => handle_override_save(overrideTarget.day, stock, price)}
        />
      )}
    </div>
  );
};

// ─── 하위 컴포넌트 (모달) ───────────────────────────────────
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)' }}>재고 및 가격 수정</h3>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><i className="fa-solid fa-xmark" style={{ fontSize: '1.1rem' }}></i></button>
        </div>

        <div style={{ background: 'var(--bg-light)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>수정 일자</span>
          <span style={{ fontWeight: 800, color: 'var(--text-dark)' }}>{date}</span>
        </div>

        <div className="form-group">
          <label className="form-label">잔여 재고 (실/대): <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{stock}</span></label>
          <input
            type="range" min="0" max="20" value={stock} onChange={(e) => setStock(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">일일 적용 가격 (KRW)</label>
          <input
            type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))}
            className="form-input"
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button onClick={onClose} className="btn-secondary" style={{ flex: 1, padding: '0.7rem' }}>취소</button>
          <button onClick={() => onSave(stock, price)} className="btn-primary" style={{ flex: 1, padding: '0.7rem' }}>설정 적용</button>
        </div>
      </div>
    </div>
  );
};
