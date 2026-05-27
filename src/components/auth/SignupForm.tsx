import React, { useState } from 'react';
import { useAuthForm } from '@/hooks/useAuthForm';
import { useTravelStore } from '@/store/useTravelStore';

export const SignupForm: React.FC = () => {
  const { addToast } = useTravelStore();
  const { isLoading, handleSignup, validateEmail } = useAuthForm();

  const [signupRole, setSignupRole] = useState<'cust' | 'sell'>('cust');
  const [signupEmail, setSignupEmail] = useState('');
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('');

  const handleEmailCheck = () => {
    if (!validateEmail(signupEmail)) return;

    // Mock check
    if (signupEmail === 'test@test.com') {
      addToast("이미 사용 중인 이메일 주소입니다.", "warning");
      setIsEmailChecked(false);
    } else {
      addToast("사용 가능한 이메일입니다!", "success");
      setIsEmailChecked(true);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSignup({
      email: signupEmail,
      password: signupPassword,
      passwordConfirm: signupPasswordConfirm,
      role: signupRole,
      isEmailChecked
    });
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="text-center select-none">
        <h3 className="text-[1.5rem] font-[900] text-[#1e293b] tracking-[-0.5px]">
          반가워요! <span className="highlight-text">온데 시작하기</span>
        </h3>
        <p className="text-xs text-slate-400 mt-2 font-medium">
          단 3초 만에 가입하고 온데만의 스페셜 혜택을 받아보세요
        </p>
      </div>
      
      <div className="h-[30px] w-full"></div>
      
      <div className="form-group">
        <label className="form-label">가입 등급 선택</label>
        <select 
          className="form-input"
          value={signupRole}
          onChange={(e) => setSignupRole(e.target.value as 'cust' | 'sell')}
          disabled={isLoading}
        >
          <option value="cust">나만의 특별한 여행 (일반 사용자)</option>
          <option value="sell">여정의 파트너 (판매자)</option>
        </select>
      </div>
      
      <div className="form-group">
        <label className="form-label">이메일 계정 (ID)</label>
        <div className="flex gap-2">
          <input 
            type="email" 
            className="form-input flex-1" 
            placeholder="example@travel.com"
            value={signupEmail}
            onChange={(e) => {
              setSignupEmail(e.target.value);
              setIsEmailChecked(false);
            }}
            required
            autoFocus
            disabled={isLoading}
          />
          <button 
            type="button" 
            className="btn-primary w-auto px-[15px] text-[0.8rem] whitespace-nowrap" 
            onClick={handleEmailCheck}
            disabled={isLoading}
          >
            중복 확인
          </button>
        </div>
        {isEmailChecked && (
          <p className="text-[0.8rem] text-primary mt-1.5 font-bold flex items-center gap-1 animate-[fadeIn_0.2s_ease]">
            <i className="fa-solid fa-circle-check"></i> 사용 가능한 이메일입니다.
          </p>
        )}
      </div>
      
      <div className="form-group">
        <label className="form-label">비밀번호</label>
        <input 
          type="password" 
          className="form-input" 
          placeholder="영문, 숫자 혼합 8자리 이상"
          value={signupPassword}
          onChange={(e) => setSignupPassword(e.target.value)}
          required
          disabled={isLoading}
          maxLength={20}
        />
      </div>

      <div className="form-group">
        <label className="form-label">비밀번호 확인</label>
        <input 
          type="password" 
          className="form-input" 
          placeholder="비밀번호를 한 번 더 입력해주세요"
          value={signupPasswordConfirm}
          onChange={(e) => setSignupPasswordConfirm(e.target.value)}
          required
          disabled={isLoading}
          maxLength={20}
        />
      </div>
      
      <button 
        type="submit" 
        className="btn-primary w-full mt-2"
        style={{ opacity: isLoading ? 0.7 : 1 }}
        disabled={isLoading}
      >
        {isLoading ? (
          <span><i className="fa-solid fa-circle-notch fa-spin"></i> 가입 처리 중...</span>
        ) : "동의 및 가입 완료"}
      </button>
    </form>
  );
};
