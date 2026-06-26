import React, { useEffect, useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import {
  verify_business_api,
  save_seller_profile_api,
  get_seller_settlement_account_api,
} from '@/api/sellerApi';
import { KOREAN_BANKS } from '@/constants/appConstants';
import { extractApiErrorMessage } from '@/utils/apiResponse';

export const SellerAccountPanel: React.FC = () => {
  const { addToast } = useTravelStore();

  const [businessName, setBusinessName] = useState('온데 글로벌 리조트');
  const [contactPhone, setContactPhone] = useState('02-1234-5678');
  const [address] = useState('서울 강남구');

  // ─── 사업자 진위 확인 ─────────────────────────
  const [businessNumber, setBusinessNumber] = useState('');
  const [representativeName, setRepresentativeName] = useState('');
  const [openDate, setOpenDate] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isBusinessVerified, setIsBusinessVerified] = useState(false);

  // ─── 정산 계좌 관리 ───────────────────────────
  const [bankName, setBankName] = useState('신한은행');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [showAccount, setShowAccount] = useState(false);

  // ─── 저장 상태 ────────────────────────────────
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    get_seller_settlement_account_api()
      .then((res) => {
        if (!res.success || !res.data) return;
        setBankName(res.data.bankName);
        setAccountHolder(res.data.accountHolder);
        setBusinessNumber(
          res.data.businessNumber.length === 10
            ? `${res.data.businessNumber.slice(0, 3)}-${res.data.businessNumber.slice(3, 5)}-${res.data.businessNumber.slice(5)}`
            : res.data.businessNumber
        );
        setRepresentativeName(res.data.representativeName);
        setOpenDate(res.data.openedAt);
        setIsBusinessVerified(true);
      })
      .catch(() => undefined);
  }, []);



  const formatBusinessNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  };

  const handle_business_verify = async () => {
    const rawNum = businessNumber.replace(/\D/g, '');
    if (rawNum.length !== 10) {
      addToast('사업자등록번호는 10자리 숫자를 입력해 주세요. (예: 123-45-67890)', 'warning');
      return;
    }
    if (!representativeName.trim()) {
      addToast('대표자 성명을 입력해 주세요.', 'warning');
      return;
    }
    if (openDate.length !== 8 || !/^\d{8}$/.test(openDate)) {
      addToast('개업일자는 8자리 숫자로 입력해 주세요. (예: 20200101)', 'warning');
      return;
    }

    setIsVerifying(true);
    addToast('사업자 진위를 국세청 API를 통해 실시간으로 확인 중입니다...', 'info');

    try {
      const res = await verify_business_api({
        businessNumber: rawNum,
        representativeName: representativeName.trim(),
        openDate,
      });

      if (res.success && res.verified) {
        setIsBusinessVerified(true);
        addToast('✅ 정상 사업자로 확인되었습니다. 이제 저장하기 버튼이 활성화됩니다.', 'success');
      } else {
        setIsBusinessVerified(false);
        addToast(res.message || '사업자 정보가 일치하지 않습니다. 입력 내용을 다시 확인해 주세요.', 'warning');
      }
    } catch (err: any) {
      setIsBusinessVerified(false);
      addToast(extractApiErrorMessage(err, '사업자 진위 확인 중 오류가 발생했습니다.'), 'warning');
    } finally {
      setIsVerifying(false);
    }
  };

  const handle_save = async () => {
    if (!isBusinessVerified) {
      addToast('사업자 진위 확인을 먼저 완료해 주세요.', 'warning');
      return;
    }
    if (!accountNumber.trim() || !accountHolder.trim()) {
      addToast('정산 계좌번호와 예금주 성명을 입력해 주세요.', 'warning');
      return;
    }

    setIsSaving(true);
    addToast('업체 프로필 및 정산 계좌 정보를 안전하게 갱신 중입니다...', 'info');

    try {
      const res = await save_seller_profile_api({
        businessName,
        contactPhone,
        address,
        businessNumber: businessNumber.replace(/\D/g, ''),
        representativeName,
        openDate,
        bankName,
        accountNumber,
        accountHolder,
      });

      if (res.success) {
        addToast('업체 프로필 정보와 정산 계좌가 안전하게 갱신 완료되었습니다.', 'success');
      } else {
        addToast(res.message || '업체 프로필 정보 저장에 실패했습니다.', 'warning');
      }
    } catch (err: any) {
      addToast(extractApiErrorMessage(err, '업체 프로필 정보 저장에 실패했습니다.'), 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="seller-panel">
      {/* Header Area */}
      <div className="section-header">
        <div>
          <h2 className="section-title">업체 프로필 및 정산 계좌 설정</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            플랫폼 노출 정보와 대금 정산을 위한 보안 설정을 관리합니다.
          </p>
        </div>
        <span className="badge" style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #dcfce7' }}>
          인증 상태: 정상 파트너
        </span>
      </div>

      <div className="grid-2">
        {/* Basic Business Info & Verification */}
        <div className="wizard-container">
          <h4 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>
            <i className="fa-solid fa-building" style={{ marginRight: '0.5rem' }}></i> 기본 업체 정보
          </h4>

          <div className="form-group">
            <label className="form-label">업체 상호명 (노출명)</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">고객센터 연락처</label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">사업장 소재지 주소</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={address}
                readOnly
                className="form-input"
                style={{ flex: 1 }}
              />
              <button
                className="btn-secondary"
                style={{ whiteSpace: 'nowrap' }}
                onClick={() => addToast('[데모] 카카오 주소 검색 API 위젯이 활성화됩니다.', 'info')}
              >
                주소 검색
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">사업자 등록번호 (진위 확인 필수)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={businessNumber}
                onChange={(e) => setBusinessNumber(formatBusinessNumber(e.target.value))}
                className="form-input"
                style={{ flex: 1 }}
                placeholder="123-45-67890"
                maxLength={12}
              />
              <button
                className="btn-secondary"
                style={{ whiteSpace: 'nowrap' }}
                onClick={handle_business_verify}
                disabled={isVerifying}
              >
                {isVerifying ? '진행중...' : '진위 확인'}
              </button>
            </div>
          </div>

          <div className="grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">대표자 성명</label>
              <input
                type="text"
                value={representativeName}
                onChange={(e) => setRepresentativeName(e.target.value)}
                className="form-input"
                placeholder="홍길동"
              />
            </div>
            <div className="form-group">
              <label className="form-label">개업일자 (8자리)</label>
              <input
                type="text"
                value={openDate}
                onChange={(e) => setOpenDate(e.target.value.replace(/\D/g, '').slice(0, 8))}
                className="form-input"
                placeholder="20200101"
                maxLength={8}
              />
            </div>
          </div>

          {isBusinessVerified && (
            <div style={{ background: 'rgba(0, 138, 5, 0.06)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0, 138, 5, 0.15)', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#008a05' }}>
                <i className="fa-solid fa-circle-check" style={{ marginRight: '0.4rem' }}></i>
                사업자 인증이 완료되었습니다. 정보 저장이 가능합니다.
              </p>
            </div>
          )}

          <button
            className="btn-primary"
            style={{
              width: '100%',
              padding: '0.8rem',
              opacity: (!isBusinessVerified || isSaving) ? 0.5 : 1,
              cursor: (!isBusinessVerified || isSaving) ? 'not-allowed' : 'pointer',
            }}
            onClick={handle_save}
            disabled={!isBusinessVerified || isSaving}
          >
            {isSaving ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '0.4rem' }}></i> 저장 중...</> : <><i className="fa-solid fa-floppy-disk" style={{ marginRight: '0.4rem' }}></i> 파트너 프로필 최종 저장</>}
          </button>
        </div>

        {/* Settlement Account Setting */}
        <div className="wizard-container">
          <h4 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>
            <i className="fa-solid fa-credit-card" style={{ marginRight: '0.5rem' }}></i> 정산 계좌 관리 (보안)
          </h4>

          <div style={{ background: 'rgba(255, 90, 95, 0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 90, 95, 0.2)', marginBottom: '1.2rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 600 }}>
              <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '0.3rem' }}></i>
              주의: 계좌 정보 변경 시 다음 정산 주기부터 적용되며, 본인 확인 절차가 추가로 진행될 수 있습니다.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">정산 수령 은행</label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="form-input"
            >
              {KOREAN_BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">계좌번호</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showAccount ? 'text' : 'password'}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                className="form-input"
                style={{ width: '100%', paddingRight: '2.5rem' }}
                placeholder="000-000-000000"
              />
              <button
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none' }}
                onClick={() => setShowAccount(!showAccount)}
              >
                <i className={`fa-solid ${showAccount ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">예금주 성명</label>
            <input
              type="text"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              className="form-input"
              placeholder="법인명 또는 대표자 성명"
            />
          </div>

          <button
            className="btn-primary"
            style={{
              width: '100%',
              padding: '0.8rem',
              marginTop: '0.5rem',
              background: '#008a05',
              border: 'none',
              opacity: (!isBusinessVerified || isSaving) ? 0.5 : 1,
              cursor: (!isBusinessVerified || isSaving) ? 'not-allowed' : 'pointer',
            }}
            onClick={handle_save}
            disabled={!isBusinessVerified || isSaving}
          >
            {isSaving ? '저장 중...' : '정산 계좌 정보 업데이트'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <button
          className="btn-primary"
          style={{ padding: '0.8rem 3rem', fontSize: '1rem' }}
          onClick={handle_save}
        >
          업체 프로필 정보 저장하기
        </button>
      </div>
    </div>
  );
};
