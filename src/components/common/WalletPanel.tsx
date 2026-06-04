import React, { useState } from 'react';
import { charge_wallet_api } from '@/api/userApi';
import { useTravelStore } from '@/store/useTravelStore';

export const WalletPanel: React.FC = () => {
  const { walletBalance, setMemberProfile, membershipGrade, mileage, addToast } = useTravelStore();
  const [isCharging, setIsCharging] = useState(false);
  const [chargeAmount, setChargeAmount] = useState<number>(1000000);

  const handleCharge = async () => {
    setIsCharging(true);
    const res = await charge_wallet_api(chargeAmount);
    if (res.success) {
      setMemberProfile({ mileage, membershipGrade }, res.data);
      addToast(`지갑에 ₩${chargeAmount.toLocaleString('ko-KR')}이 충전되었습니다.`, 'success');
    } else {
      addToast(res.message, 'warning');
    }
    setIsCharging(false);
  };

  return (
    <div
      style={{
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)',
        borderRadius: '1.25rem',
        padding: '2.5rem 2rem',
        color: '#ffffff',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative glowing gradient elements for premium feel */}
      <div style={{
        position: 'absolute',
        top: '-40%',
        right: '-10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
        filter: 'blur(30px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-40%',
        left: '-10%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
        filter: 'blur(30px)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.95)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <i className="fa-solid fa-wallet" style={{ color: '#c7d2fe', fontSize: '1.1rem' }}></i>
            ONDE WALLET
          </h3>
          <p style={{ margin: '0.5rem 0 0', color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.9rem', fontWeight: 300 }}>
            결제 시 현금처럼 자유롭게 사용하세요
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <strong style={{ fontSize: '2.5rem', color: '#ffffff', fontFamily: 'GmarketSansBold, sans-serif', letterSpacing: '-0.5px' }}>
            ₩{walletBalance.toLocaleString('ko-KR')}
          </strong>
        </div>
      </div>

      <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ position: 'relative', width: '220px' }}>
          <select
            value={chargeAmount}
            onChange={(e) => setChargeAmount(Number(e.target.value))}
            disabled={isCharging}
            style={{
              width: '100%',
              padding: '0.875rem 1.25rem',
              borderRadius: '0.75rem',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 500,
              backdropFilter: 'blur(10px)',
              outline: 'none',
              appearance: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
          >
            <option value={100000} style={{ color: '#1e293b' }}>₩100,000 충전</option>
            <option value={500000} style={{ color: '#1e293b' }}>₩500,000 충전</option>
            <option value={1000000} style={{ color: '#1e293b' }}>₩1,000,000 충전</option>
            <option value={5000000} style={{ color: '#1e293b' }}>₩5,000,000 충전</option>
          </select>
          <i className="fa-solid fa-chevron-down" style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.7)', pointerEvents: 'none' }}></i>
        </div>
        <button
          onClick={handleCharge}
          disabled={isCharging}
          style={{
            padding: '0.875rem 2rem',
            borderRadius: '0.75rem',
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            color: '#fff',
            border: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: isCharging ? 'not-allowed' : 'pointer',
            opacity: isCharging ? 0.7 : 1,
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)'
          }}
          onMouseOver={(e) => {
            if (!isCharging) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(79, 70, 229, 0.5)';
            }
          }}
          onMouseOut={(e) => {
            if (!isCharging) {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(79, 70, 229, 0.4)';
            }
          }}
        >
          {isCharging ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-bolt" />}
          {isCharging ? '충전 중...' : '충전하기'}
        </button>
      </div>
    </div>
  );
};
