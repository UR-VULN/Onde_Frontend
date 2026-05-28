import React from 'react';

const PRIMARY = '#005ce6';

interface MileageUsagePanelProps {
  availableBalance: number;
  orderTotal: number;
  value: number;
  onChange: (amount: number) => void;
}

function clampMileage(amount: number, cap: number): number {
  return Math.max(0, Math.min(cap, Math.floor(amount)));
}

export const MileageUsagePanel: React.FC<MileageUsagePanelProps> = ({
  availableBalance,
  orderTotal,
  value,
  onChange,
}) => {
  const cap = Math.min(availableBalance, orderTotal);

  const handleInput = (raw: string) => {
    const parsed = raw === '' ? 0 : Number(raw.replace(/[^\d]/g, ''));
    if (Number.isNaN(parsed)) return;
    onChange(clampMileage(parsed, cap));
  };

  const step = (delta: number) => {
    onChange(clampMileage(value + delta, cap));
  };

  return (
    <div style={{
      padding: '0.7rem 0.9rem',
      background: 'rgba(0,92,230,0.03)',
      border: '1px solid rgba(0,92,230,0.12)',
      borderRadius: '12px',
      marginBottom: '0.4rem',
    }}>
      <div style={{ marginBottom: '0.55rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: PRIMARY, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <i className="fa-solid fa-gift" /> 마일리지 사용
        </span>
        <span style={{ fontSize: '0.7rem', color: '#717171', display: 'block', marginTop: '2px' }}>
          보유 <strong>{availableBalance.toLocaleString('ko-KR')} P</strong>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
        <button
          type="button"
          onClick={() => step(-1000)}
          disabled={value <= 0}
          style={{
            width: '32px', height: '32px', borderRadius: '8px',
            border: '1px solid #ddd', background: '#fff',
            fontSize: '1rem', fontWeight: 700, cursor: value <= 0 ? 'not-allowed' : 'pointer',
            color: value <= 0 ? '#ccc' : PRIMARY,
          }}
        >
          −
        </button>

        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            inputMode="numeric"
            value={value === 0 ? '' : value.toLocaleString('ko-KR')}
            placeholder="0"
            onChange={(e) => handleInput(e.target.value)}
            style={{
              width: '100%', padding: '0.45rem 2rem 0.45rem 0.65rem',
              border: '1px solid #ddd', borderRadius: '8px',
              fontSize: '0.85rem', fontWeight: 700, color: '#1a1a1a',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
          <span style={{
            position: 'absolute', right: '0.65rem', top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '0.75rem', fontWeight: 700, color: '#717171',
          }}>
            P
          </span>
        </div>

        <button
          type="button"
          onClick={() => step(1000)}
          disabled={value >= cap}
          style={{
            width: '32px', height: '32px', borderRadius: '8px',
            border: '1px solid #ddd', background: '#fff',
            fontSize: '1rem', fontWeight: 700, cursor: value >= cap ? 'not-allowed' : 'pointer',
            color: value >= cap ? '#ccc' : PRIMARY,
          }}
        >
          +
        </button>

        <button
          type="button"
          onClick={() => onChange(cap)}
          disabled={cap <= 0}
          style={{
            padding: '0.45rem 0.65rem', borderRadius: '8px',
            border: `1px solid ${PRIMARY}`, background: '#fff',
            fontSize: '0.72rem', fontWeight: 800, color: PRIMARY,
            cursor: cap <= 0 ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
            opacity: cap <= 0 ? 0.5 : 1,
          }}
        >
          전액
        </button>
      </div>
    </div>
  );
};

/** 주문 금액·보유 마일리지 변경 시 사용액 보정 */
export function clampMileageUsage(
  current: number,
  availableBalance: number,
  orderTotal: number,
): number {
  const cap = Math.min(availableBalance, orderTotal);
  return clampMileage(current, cap);
}
