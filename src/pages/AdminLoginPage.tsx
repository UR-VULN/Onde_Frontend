import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthForm } from '@/hooks/useAuthForm';
import { useTravelStore } from '@/store/useTravelStore';
import { isAdminRole } from '@/utils/memberRole';
import { getAdminHomePath, resolveMainSiteUrl } from '@/constants/adminPortal';
import { performLogout } from '@/utils/authSession';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { isLoading, handleAdminLogin } = useAuthForm();
  const { isLoggedIn, memberRole } = useTravelStore();
  const navigate = useNavigate();

  // If already logged in as admin, redirect to admin main page
  useEffect(() => {
    if (isLoggedIn && isAdminRole(memberRole)) {
      navigate(getAdminHomePath(), { replace: true });
    }
  }, [isLoggedIn, memberRole, navigate]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAdminLogin(email, password);
  };

  const handleGoToMain = () => {
    void performLogout();
    window.location.href = resolveMainSiteUrl();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f7f9fa] font-main relative">
      {/* Background Accents to add depth without clutter */}
      <div className="absolute top-0 left-0 w-full h-[320px] bg-gradient-to-b from-slate-100 to-transparent pointer-events-none" />

      <div className="w-full max-w-[440px] mx-4 z-10">
        {/* Main Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-[scaleUp_0.3s_ease-out]">
          
          {/* Header & Logo */}
          <div className="flex flex-col items-center mb-8 select-none">
            <div className="logo cursor-default flex items-center gap-3 text-2xl font-bold text-slate-800 mb-4">
              <div className="logo-box bg-indigo-600 rounded-lg p-2 text-white flex flex-col text-xs font-black leading-none w-10 h-10 items-center justify-center">
                <span>ON</span>
                <span>DE</span>
              </div>
              <span className="font-extrabold tracking-tight">온데</span>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 uppercase tracking-wider ml-1">
                관리자
              </span>
            </div>
            <p className="text-slate-400 text-xs font-medium">
              온데 백오피스 서비스 보호 구역입니다.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 tracking-wider uppercase pl-1">
                관리자 이메일
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <i className="fa-regular fa-envelope"></i>
                </span>
                <input
                  type="email"
                  className="w-full bg-[#f8fafc] border border-slate-200 text-slate-800 placeholder-slate-400 text-sm rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-semibold"
                  placeholder="example@travel.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 tracking-wider uppercase pl-1">
                비밀번호
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <i className="fa-solid fa-lock"></i>
                </span>
                <input
                  type="password"
                  className="w-full bg-[#f8fafc] border border-slate-200 text-slate-800 placeholder-slate-400 text-sm rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-semibold"
                  placeholder="비밀번호를 입력해주세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  maxLength={20}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm py-3.5 rounded-xl shadow-md hover:shadow-indigo-500/10 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fa-solid fa-circle-notch fa-spin"></i> 인증 처리 중...
                </span>
              ) : (
                '로그인'
              )}
            </button>
          </form>

        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={handleGoToMain}
            className="text-xs font-black text-slate-400 hover:text-slate-600 transition-colors"
          >
            <i className="fa-solid fa-arrow-left mr-1.5"></i> 일반 서비스 메인 홈으로
          </button>
        </div>
      </div>
    </div>
  );
};
