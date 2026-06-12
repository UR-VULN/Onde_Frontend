import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTravelStore } from '@/store/useTravelStore';

export const EmailSignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<1 | 2>(1); // 1: 이메일 입력, 2: 인증번호 입력
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, addToast } = useTravelStore();

  // 1. 접속 환경 감지 로직 추가 (운영 환경과 로컬 환경 분기)
  const isLocal = window.location.hostname === 'localhost';
  const backendUrl = isLocal ? 'http://localhost:8080' : 'https://onde.click';

  // 1. 인증번호 발송 요청
  const handleSendCode = async () => {
    if (!email) return addToast("이메일을 입력해주세요.", "warning");
    
    setIsLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/v1/auth/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        addToast("인증번호가 발송되었습니다. 이메일을 확인해주세요.", "success");
        setStep(2);
      } else {
        addToast("인증번호 발송에 실패했습니다.", "warning");
      }
    } catch (error) {
        console.error("인증번호 발송 에러:", error); 
        addToast("서버 오류가 발생했습니다.", "warning");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 인증번호 검증 요청
  const handleVerifyCode = async () => {
    if (!code) return addToast("인증번호를 입력해주세요.", "warning");
    
    setIsLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/v1/auth/email/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code })
      });

      if (response.ok) {
        addToast("이메일 인증이 완료되었습니다! 환영합니다.", "success");
        
        // 인증 성공 후 상태 업데이트 및 홈으로 리다이렉트
        login("소셜유저", "cust");
        navigate('/', { replace: true });
      } else {
        addToast("잘못된 인증번호입니다.", "warning");
      }
    } catch (error) {
        console.error("이메일 인증 에러:", error); 
        addToast("서버 오류가 발생했습니다.", "warning");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-[400px]">
        <h2 className="text-2xl font-bold mb-2 text-center text-slate-800">추가 정보 입력</h2>
        <p className="mb-6 text-sm text-slate-500 text-center">원활한 서비스 이용을 위해<br/>이메일 인증을 진행해 주세요.</p>
        
        {step === 1 ? (
          <div className="flex flex-col gap-4">
            <input 
              type="email" 
              placeholder="이메일 주소" 
              className="form-input w-full px-4 py-2 border rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button 
              className="btn-primary w-full py-2 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 transition"
              onClick={handleSendCode}
              disabled={isLoading}
            >
              {isLoading ? "발송 중..." : "인증번호 받기"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="인증번호 6자리" 
              className="form-input w-full px-4 py-2 border rounded-md"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
            />
            <button 
              className="btn-primary w-full py-2 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 transition"
              onClick={handleVerifyCode}
              disabled={isLoading}
            >
              {isLoading ? "확인 중..." : "인증 완료"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};