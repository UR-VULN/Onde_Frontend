import React, { useState } from 'react';
import { useAuthForm } from '@/hooks/useAuthForm';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleBg, setGoogleBg] = useState('#4285F4');
  
  // 외부 훅에서 이메일 로그인 처리 함수만 가져옴
  const { isLoading, handleLogin } = useAuthForm();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  // 컴포넌트 내부에서 백엔드로 직접 리다이렉트시키는 소셜 로그인 함수 (환경 자동 감지 적용)
  const handleDirectSocialLogin = (platform: 'kakao' | 'google') => {
    // 1. 현재 접속한 프론트엔드 주소가 localhost인지 확인
    const isLocal = window.location.hostname === 'localhost';
    
    // 2. 로컬이면 8080 포트로, 운영이면 https://onde.click 으로 설정
    const backendUrl = isLocal ? 'http://localhost:8080' : 'https://onde.click';
    
    // 3. 동적으로 설정된 주소로 인증 요청 전송
    window.location.href = `${backendUrl}/oauth2/authorization/${platform}`;
  };
  
  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="text-center select-none">
        <h3 className="text-[1.5rem] font-[900] text-[#1e293b] tracking-[-0.5px]">
          모든 여정의 시작, <span className="highlight-text">온데 ONDE</span>
        </h3>
        <p className="text-xs text-slate-400 mt-2 font-medium">
          내가 온 데부터 시작하는 나만의 특별한 여행
        </p>
      </div>
      
      <div className="h-[30px] w-full"></div>
      
      <div className="form-group">
        <label className="form-label">이메일 주소</label>
        <input 
          type="email" 
          className="form-input" 
          placeholder="example@travel.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          disabled={isLoading}
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">비밀번호</label>
        <input 
          type="password" 
          className="form-input" 
          placeholder="비밀번호를 입력해주세요"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          maxLength={20}
        />
      </div>
      
      <button 
        type="submit" 
        className="btn-primary"
        style={{ width: '100%', marginTop: '1.2rem', opacity: isLoading ? 0.7 : 1 }}
        disabled={isLoading}
      >
        {isLoading ? (
          <span><i className="fa-solid fa-circle-notch fa-spin"></i> 로그인 중...</span>
        ) : "로그인"}
      </button>
      
      <div style={{ margin: '2rem 0', borderTop: '1px solid #ddd', position: 'relative' }}>
        <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '0 10px', fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          소셜 간편 로그인
        </span>
      </div>
      
      <button 
        type="button"
        className="btn-secondary" 
        style={{ width: '100%', background: '#fee500', border: 'none', color: '#3c1e1e' }}
        onClick={() => handleDirectSocialLogin('kakao')}
        disabled={isLoading}
      >
        <i className="fa-solid fa-comment"></i> 카카오 로그인
      </button>
      
      <button 
        type="button"
        className="btn-secondary" 
        style={{ width: '100%', background: googleBg, border: 'none', marginTop: '0.8rem', color: '#ffffff', fontWeight: 700, transition: 'background-color 0.25s ease' }}
        onMouseEnter={() => setGoogleBg('#357ae8')}
        onMouseLeave={() => setGoogleBg('#4285F4')}
        onClick={() => handleDirectSocialLogin('google')} 
        disabled={isLoading}
      >
        <i className="fa-brands fa-google" style={{ color: '#ffffff', marginRight: '0.4rem' }}></i> 구글 로그인
      </button>
    </form>
  );
};