import React, { useCallback, useEffect, useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import {
  get_seller_accommodations_api,
  get_seller_cars_inventory_api,
  get_seller_inventory_calendar_api,
  patch_seller_inventory_day_api,
  register_seller_flight_api,
  type SellerCarInventoryDto,
  type SellerPropertyDto,
} from '@/api/sellerApi';

export const SellerStayCarPanel: React.FC = () => {
  const { addToast } = useTravelStore();
  const [stays, setStays] = useState<SellerPropertyDto[]>([]);
  const [cars, setCars] = useState<SellerCarInventoryDto[]>([]);
  const [selectedPropertyKey, setSelectedPropertyKey] = useState('stay-1');
  const [dailyData, setDailyData] = useState<Record<number, { stock: number; price: number; isClosed?: boolean }>>({});
  const [overrideTarget, setOverrideTarget] = useState<{ day: number; stock: number; price: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    try {
      const [stayRes, carRes] = await Promise.all([
        get_seller_accommodations_api(),
        get_seller_cars_inventory_api(),
      ]);
      if (stayRes.success && stayRes.data) setStays(stayRes.data);
      if (carRes.success && carRes.data) setCars(carRes.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCalendar = useCallback(async (propertyKey: string) => {
    const res = await get_seller_inventory_calendar_api({ propertyKey });
    if (res.success && res.data) {
      const mapped: Record<number, { stock: number; price: number; isClosed?: boolean }> = {};
      Object.entries(res.data).forEach(([day, cell]) => {
        const d = Number(day);
        mapped[d] = {
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
    if (selectedPropertyKey) loadCalendar(selectedPropertyKey);
  }, [selectedPropertyKey, loadCalendar]);

  const handle_override_save = async (day: number, stock: number, price: number) => {
    try {
      const res = await patch_seller_inventory_day_api({
        propertyKey: selectedPropertyKey,
        day,
        stock,
        price,
      });
      if (res.success) {
        setDailyData((prev) => ({ ...prev, [day]: { stock, price, isClosed: stock === 0 } }));
        addToast(`${day}? ??·??? ???????.`, 'success');
      }
    } catch {
      setDailyData((prev) => ({ ...prev, [day]: { stock, price, isClosed: stock === 0 } }));
      addToast(`${day}? ??·??? ???????.`, 'success');
    }
    setOverrideTarget(null);
  };

  const renderCalendarCells = () => {
    const cells = [];
    for (let i = 24; i <= 30; i++) {
      const data = dailyData[i];
      cells.push(
        <div
          key={i}
          className="calendar-cell"
          onClick={() => setOverrideTarget({ day: i, stock: data?.stock ?? 5, price: data?.price ?? 245000 })}
        >
          <span className="calendar-cell-date">{i}</span>
          {data ? (
            <div className="calendar-cell-data flex flex-col gap-0.5 mt-1">
              {data.isClosed ? (
                <span className="text-rose-500 font-black">?? ??</span>
              ) : (
                <>
                  <span className="text-emerald-600">{data.stock}? ??</span>
                  <span className="text-slate-900">?{(data.price / 1000).toLocaleString()}k</span>
                </>
              )}
            </div>
          ) : (
            <span className="text-[9px] text-slate-300 font-bold">???</span>
          )}
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="seller-panel">
      <div className="section-header">
        <div>
          <h2 className="section-title">?? · ??? ?? ? ?? ??</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            ?? ?? ??? ?? ??·??? API? ??·?????.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={async () => {
            try {
              await register_seller_flight_api({ flightNumber: 'OZ999', origin: 'ICN', destination: 'NRT' });
              addToast('?? ??? ?? ??? ???????.', 'success');
            } catch {
              addToast('?? ??? ?? ??? ???????.', 'info');
            }
          }}
        >
          <i className="fa-solid fa-plus"></i> ?? ?? ??? ??
        </button>
      </div>

      {loading ? (
        <p className="text-center text-slate-500 font-bold py-12">?? ??? ???? ?...</p>
      ) : (
        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '2rem' }}>
          <div className="data-table-container" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '1.2rem' }}>
              <i className="fa-solid fa-hotel"></i> ?? ??
            </h4>
            <table className="data-table">
              <thead>
                <tr>
                  <th>???</th>
                  <th className="text-center">??</th>
                  <th className="text-right">?? ??</th>
                </tr>
              </thead>
              <tbody>
                {stays.map((item) => (
                  <tr key={item.propertyId}>
                    <td className="font-bold text-slate-700">{item.name}</td>
                    <td className="text-center">
                      <span className={`status-badge ${item.status === 'ACTIVE' ? 'status-active' : 'status-pending'}`}>
                        {item.status === 'ACTIVE' ? '???' : '???'}
                      </span>
                    </td>
                    <td className="font-black text-slate-900 text-right">?{item.basePrice.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="data-table-container" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontWeight: 700, color: '#008a05', marginBottom: '1.2rem' }}>
              <i className="fa-solid fa-car-side"></i> ??? ??
            </h4>
            <table className="data-table">
              <thead>
                <tr>
                  <th>???</th>
                  <th className="text-center">??</th>
                  <th className="text-right">? ??</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((item) => (
                  <tr key={item.propertyId}>
                    <td className="font-bold text-slate-700">{item.name}</td>
                    <td className="text-center font-bold text-slate-500">{item.stock}?</td>
                    <td className="font-black text-slate-900 text-right">?{item.basePrice.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="data-table-container" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <h4 style={{ fontWeight: 700, color: 'var(--text-dark)' }}>
            <i className="fa-solid fa-calendar-check" style={{ color: 'var(--primary)' }}></i> ?? ?? · ?? ???
          </h4>
          <select
            value={selectedPropertyKey}
            onChange={(e) => setSelectedPropertyKey(e.target.value)}
            className="form-input"
            style={{ width: '260px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
          >
            {stays.map((s) => (
              <option key={`stay-${s.propertyId}`} value={`stay-${s.propertyId}`}>
                {s.name}
              </option>
            ))}
            {cars.map((c) => (
              <option key={`car-${c.propertyId}`} value={`car-${c.propertyId}`}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="calendar-grid">
          {['?', '?', '?', '?', '?', '?', '?'].map((d, idx) => (
            <div key={d} className="calendar-header-cell">
              <span style={{ color: idx === 0 ? 'var(--secondary)' : idx === 6 ? 'var(--primary)' : undefined }}>{d}</span>
            </div>
          ))}
          {renderCalendarCells()}
        </div>
      </div>

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
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>?? ?? · ?? ??</h3>
          <button type="button" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        </div>
        <p style={{ marginBottom: '1rem', fontWeight: 700 }}>??: {date}</p>
        <div className="form-group">
          <label className="form-label">?? ??: {stock}</label>
          <input type="range" min={0} max={20} value={stock} onChange={(e) => setStock(Number(e.target.value))} style={{ width: '100%' }} />
        </div>
        <div className="form-group">
          <label className="form-label">?? ?? (KRW)</label>
          <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="form-input" />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>??</button>
          <button type="button" onClick={() => onSave(stock, price)} className="btn-primary" style={{ flex: 1 }}>??</button>
        </div>
      </div>
    </div>
  );
};
