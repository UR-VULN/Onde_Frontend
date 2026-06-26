import React, { useState } from 'react';
import { useAuthForm } from '@/hooks/useAuthForm';
import { check_nickname_api, check_email_api } from '@/api/authApi';
import { useTravelStore } from '@/store/useTravelStore';
import { PASSWORD_POLICY_HINT } from '@/utils/passwordPolicy';
import { extractApiErrorMessage } from '@/utils/apiResponse';

export const SignupForm: React.FC = () => {
  const { isLoading, handleSignup, validateEmail } = useAuthForm();
  const { addToast } = useTravelStore();

  const [signupRole, setSignupRole] = useState<'cust' | 'sell'>('cust');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupNickname, setSignupNickname] = useState('');
  const [signupAge, setSignupAge] = useState('');

  // 이메일 중복확인 상태 관리
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [checkedEmailValue, setCheckedEmailValue] = useState('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // 닉네임 중복확인 상태 관리
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [checkedNicknameValue, setCheckedNicknameValue] = useState('');
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);

  const handleEmailCheck = async () => {
    const trimmed = signupEmail.trim();
    if (!trimmed) {
      addToast('중복확인할 이메일을 입력해 주세요.', 'warning');
      return;
    }
    if (!validateEmail(trimmed)) return;

    setIsCheckingEmail(true);
    try {
      const res = await check_email_api(trimmed);
      if (res.success) {
        if (res.data) {
          addToast('이미 사용 중인 이메일입니다.', 'warning');
          setIsEmailChecked(false);
        } else {
          addToast('사용 가능한 이메일입니다!', 'success');
          setIsEmailChecked(true);
          setCheckedEmailValue(trimmed);
        }
      } else {
        addToast(res.message || '이메일 중복 확인 실패', 'warning');
      }
    } catch (err: unknown) {
      addToast(extractApiErrorMessage(err, '이메일 중복 확인 중 오류가 발생했습니다.'), 'warning');
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleNicknameCheck = async () => {
    const trimmed = signupNickname.trim();
    if (!trimmed) {
      addToast('중복확인할 닉네임을 입력해 주세요.', 'warning');
      return;
    }
    if (trimmed.length < 2) {
      addToast('닉네임은 최소 2글자 이상 입력해 주세요.', 'warning');
      return;
    }

    setIsCheckingNickname(true);
    try {
      const res = await check_nickname_api(trimmed);
      if (res.success) {
        if (res.data) {
          // 중복됨
          addToast('이미 사용 중인 닉네임입니다.', 'warning');
          setIsNicknameChecked(false);
        } else {
          // 사용 가능
          addToast('사용 가능한 닉네임입니다!', 'success');
          setIsNicknameChecked(true);
          setCheckedNicknameValue(trimmed);
        }
      } else {
        addToast(res.message || '닉네임 중복 확인 실패', 'warning');
      }
    } catch (err: unknown) {
      addToast(extractApiErrorMessage(err, '닉네임 중복 확인 중 오류가 발생했습니다.'), 'warning');
    } finally {
      setIsCheckingNickname(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(signupEmail)) return;

    if (!isEmailChecked || checkedEmailValue !== signupEmail.trim()) {
      addToast('이메일 중복 확인이 완료되지 않았습니다.', 'warning');
      return;
    }

    if (!signupName.trim()) {
      addToast('이름을 입력해 주세요.', 'warning');
      return;
    }
    if (!signupPhone.trim()) {
      addToast('전화번호를 입력해 주세요.', 'warning');
      return;
    }
    if (!signupNickname.trim()) {
      addToast('닉네임을 입력해 주세요.', 'warning');
      return;
    }
    if (!isNicknameChecked || checkedNicknameValue !== signupNickname.trim()) {
      addToast('닉네임 중복 확인이 완료되지 않았습니다.', 'warning');
      return;
    }

    const ageNum = signupAge ? parseInt(signupAge, 10) : undefined;
    if (ageNum !== undefined && (isNaN(ageNum) || ageNum < 1 || ageNum > 120)) {
      addToast('올바른 나이(1~120세)를 입력해 주세요.', 'warning');
      return;
    }

    handleSignup({
      email: signupEmail,
      password: signupPassword,
      passwordConfirm: signupPasswordConfirm,
      role: signupRole,
      name: signupName.trim(),
      phoneNumber: signupPhone.trim(),
      nickname: signupNickname.trim(),
      age: ageNum,
    });
  };

  return (
    <form onSubmit={onSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="text-center select-none">
        <h3 className="text-[1.5rem] font-[900] text-[#1e293b] tracking-[-0.5px]">
          반가워요! <span className="highlight-text">온데 시작하기</span>
        </h3>
        <p className="text-xs text-slate-400 mt-2 font-medium">
          단 3초 만에 가입하고 온데만의 스페셜 혜택을 받아보세요
        </p>
      </div>

      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)' }}>가입 등급 선택</label>
        <select
          className="form-input"
          value={signupRole}
          onChange={(e) => setSignupRole(e.target.value as 'cust' | 'sell')}
          disabled={isLoading}
          style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '6px' }}
        >
          <option value="cust">나만의 특별한 여행 (일반 사용자)</option>
          <option value="sell">여정의 파트너 (판매자)</option>
        </select>
      </div>

      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)' }}>이메일 계정 (ID)</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="email"
            className="form-input"
            placeholder="example@travel.com"
            value={signupEmail}
            onChange={(e) => {
              setSignupEmail(e.target.value);
              if (isEmailChecked && e.target.value.trim() !== checkedEmailValue) {
                setIsEmailChecked(false);
              }
            }}
            required
            autoFocus
            disabled={isLoading}
            style={{ flex: 1, padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '6px' }}
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={handleEmailCheck}
            disabled={isLoading || isCheckingEmail}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.8rem',
              whiteSpace: 'nowrap',
              backgroundColor: isEmailChecked ? '#ecfdf5' : '#ffffff',
              color: isEmailChecked ? '#059669' : 'var(--primary)',
              borderColor: isEmailChecked ? '#a7f3d0' : 'rgba(0, 92, 230, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.2rem'
            }}
          >
            {isCheckingEmail ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : isEmailChecked ? (
              <><i className="fa-solid fa-check"></i> 완료</>
            ) : (
              '중복확인'
            )}
          </button>
        </div>
      </div>

      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)' }}>이름</label>
        <input
          type="text"
          className="form-input"
          placeholder="실명을 입력해주세요"
          value={signupName}
          onChange={(e) => setSignupName(e.target.value)}
          required
          disabled={isLoading}
          style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '6px' }}
        />
      </div>

      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)' }}>전화번호</label>
        <input
          type="tel"
          className="form-input"
          placeholder="010-1234-5678"
          value={signupPhone}
          onChange={(e) => setSignupPhone(e.target.value)}
          required
          disabled={isLoading}
          style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '6px' }}
        />
      </div>

      {/* 닉네임 + 중복확인 단추 */}
      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)' }}>닉네임</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="활동용 닉네임"
            value={signupNickname}
            onChange={(e) => {
              setSignupNickname(e.target.value);
              if (isNicknameChecked && e.target.value.trim() !== checkedNicknameValue) {
                setIsNicknameChecked(false);
              }
            }}
            required
            disabled={isLoading}
            style={{ flex: 1, padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '6px' }}
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={handleNicknameCheck}
            disabled={isLoading || isCheckingNickname}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.8rem',
              whiteSpace: 'nowrap',
              backgroundColor: isNicknameChecked ? '#ecfdf5' : '#ffffff',
              color: isNicknameChecked ? '#059669' : 'var(--primary)',
              borderColor: isNicknameChecked ? '#a7f3d0' : 'rgba(0, 92, 230, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.2rem'
            }}
          >
            {isCheckingNickname ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : isNicknameChecked ? (
              <><i className="fa-solid fa-check"></i> 완료</>
            ) : (
              '중복확인'
            )}
          </button>
        </div>
      </div>

      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)' }}>나이 (선택)</label>
        <input
          type="number"
          className="form-input"
          placeholder="만 나이"
          value={signupAge}
          onChange={(e) => setSignupAge(e.target.value)}
          disabled={isLoading}
          style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '6px' }}
        />
      </div>

      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)' }}>비밀번호</label>
        <input
          type="password"
          className="form-input"
          placeholder={PASSWORD_POLICY_HINT}
          value={signupPassword}
          onChange={(e) => setSignupPassword(e.target.value)}
          required
          disabled={isLoading}
          maxLength={128}
          style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '6px' }}
        />
      </div>

      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)' }}>비밀번호 확인</label>
        <input
          type="password"
          className="form-input"
          placeholder="비밀번호를 한 번 더 입력해주세요"
          value={signupPasswordConfirm}
          onChange={(e) => setSignupPasswordConfirm(e.target.value)}
          required
          disabled={isLoading}
          maxLength={128}
          style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '6px' }}
        />
      </div>

      <button
        type="submit"
        className="btn-primary w-full mt-2"
        style={{ opacity: isLoading ? 0.7 : 1, width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-full)', fontWeight: 700, cursor: 'pointer' }}
        disabled={isLoading}
      >
        {isLoading ? (
          <span>
            <i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: '0.3rem' }}></i> 가입 처리 중...
          </span>
        ) : (
          '동의 및 가입 완료'
        )}
      </button>
    </form>
  );
};
