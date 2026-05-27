import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import error404 from '@/assets/404.png';
import error500 from '@/assets/500.png';
import error503 from '@/assets/503.png';

type ErrorType = '404' | '500' | '503';

interface ErrorPageProps {
  errorCode?: ErrorType;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({ errorCode }) => {
  const navigate = useNavigate();
  const [activeError, setActiveError] = useState<ErrorType>(errorCode ?? '404');

  const lockedError = errorCode ?? null;

  const handleGoHome = () => navigate('/');

  const renderErrorContent = () => {
    switch (activeError) {
      case '404':
        return (
          <div className="flex flex-col items-center text-center gap-14 animate-[fadeIn_0.35s_ease]">
            {/* Giant ghost number + mascot */}
            <div className="relative flex items-center justify-center w-full" style={{ minHeight: '280px' }}>
              {/* Ghost number */}
              <span
                className="select-none font-black leading-none bg-gradient-to-br from-rose-400 via-red-400 to-orange-300 bg-clip-text text-transparent"
                style={{ fontSize: 'clamp(7rem, 18vw, 12rem)', opacity: 0.12, letterSpacing: '-0.05em' }}
              >
                404
              </span>
              {/* Mascot overlaid center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={error404}
                  alt="404 마스코트"
                  style={{ width: '320px', height: '320px', objectFit: 'contain', filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.14))' }}
                />
              </div>
            </div>

            {/* Text block */}
            <div className="space-y-6 px-2">
              <div className="inline-block bg-rose-50 border border-rose-200/60 text-rose-500 text-xs font-black px-4 py-1.5 rounded-full tracking-widest uppercase">
                404 · Page Not Found
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
                길을 잃으신 것 같아요!
              </h2>
              <p className="text-slate-500 font-medium text-base md:text-lg leading-relaxed max-w-lg mx-auto">
                찾으시는 페이지가 삭제되었거나 주소가 잘못 변경되었습니다.<br />
                온데의 든든한 가이드와 함께 안전한 곳으로 복귀해 볼까요?
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
              <button
                type="button"
                onClick={handleGoHome}
                className="btn-primary w-full sm:flex-1 py-4 px-8 rounded-full text-sm font-black shadow-lg hover:scale-105 transition-all select-none"
              >
                <i className="fa-solid fa-plane-departure mr-2"></i> 메인 홈으로 안전 비행
              </button>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="btn-secondary w-full sm:flex-1 py-4 px-8 rounded-full text-sm font-black hover:scale-105 transition-all select-none bg-white"
              >
                <i className="fa-solid fa-chevron-left mr-2"></i> 이전 화면으로
              </button>
            </div>
          </div>
        );

      case '500':
        return (
          <div className="flex flex-col items-center text-center gap-14 animate-[fadeIn_0.35s_ease]">
            <div className="relative flex items-center justify-center w-full" style={{ minHeight: '280px' }}>
              <span
                className="select-none font-black leading-none bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-400 bg-clip-text text-transparent"
                style={{ fontSize: 'clamp(7rem, 18vw, 12rem)', opacity: 0.12, letterSpacing: '-0.05em' }}
              >
                500
              </span>
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={error500}
                  alt="500 마스코트"
                  style={{ width: '320px', height: '320px', objectFit: 'contain', filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.14)) grayscale(30%)' }}
                />
              </div>
            </div>

            <div className="space-y-6 px-2">
              <div className="inline-block bg-blue-50 border border-blue-200/60 text-blue-500 text-xs font-black px-4 py-1.5 rounded-full tracking-widest uppercase">
                500 · Internal Server Error
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
                기류가 일시적으로<br />불안정합니다
              </h2>
              <p className="text-slate-500 font-medium text-base md:text-lg leading-relaxed max-w-lg mx-auto">
                서버 엔진에서 예기치 못한 오류가 발생했습니다.<br />
                ONDE 승무원들이 긴급 정비 중이니 잠시 후 다시 시도해 주세요.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn-primary w-full sm:flex-1 py-4 px-8 rounded-full text-sm font-black shadow-lg hover:scale-105 transition-all select-none"
              >
                <i className="fa-solid fa-rotate mr-2"></i> 새로고침 시도
              </button>
              <button
                type="button"
                onClick={handleGoHome}
                className="btn-secondary w-full sm:flex-1 py-4 px-8 rounded-full text-sm font-black hover:scale-105 transition-all select-none bg-white"
              >
                <i className="fa-solid fa-headset mr-2"></i> 메인으로 돌아가기
              </button>
            </div>
          </div>
        );

      case '503':
        return (
          <div className="flex flex-col items-center text-center gap-14 animate-[fadeIn_0.35s_ease]">
            <div className="relative flex items-center justify-center w-full" style={{ minHeight: '280px' }}>
              <span
                className="select-none font-black leading-none bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-300 bg-clip-text text-transparent"
                style={{ fontSize: 'clamp(5rem, 14vw, 9rem)', opacity: 0.12, letterSpacing: '-0.03em' }}
              >
                MAINT
              </span>
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={error503}
                  alt="점검 마스코트"
                  style={{ width: '320px', height: '320px', objectFit: 'contain', filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.14)) sepia(20%)' }}
                />
              </div>
            </div>

            <div className="space-y-6 px-2">
              <div className="inline-block bg-amber-50 border border-amber-200/60 text-amber-600 text-xs font-black px-4 py-1.5 rounded-full tracking-widest uppercase">
                503 · Service Unavailable
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
                안전한 여정을 위해<br />시스템 점검 중입니다
              </h2>
              <p className="text-slate-500 font-medium text-base md:text-lg leading-relaxed max-w-lg mx-auto">
                더욱 편리하고 안전한 온데를 구축하기 위해<br />
                전체 시스템 정기 정밀 정비를 실시하고 있습니다.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
              <button
                type="button"
                onClick={handleGoHome}
                className="btn-primary w-full sm:flex-1 py-4 px-8 rounded-full text-sm font-black shadow-lg hover:scale-105 transition-all select-none"
              >
                <i className="fa-solid fa-house mr-2"></i> 홈페이지 둘러보기
              </button>
              <button
                type="button"
                onClick={() => alert('정기 점검 중에는 실시간 공지 채널만 이용이 가능합니다.')}
                className="btn-secondary w-full sm:flex-1 py-4 px-8 rounded-full text-sm font-black hover:scale-105 transition-all select-none bg-white"
              >
                <i className="fa-solid fa-bullhorn mr-2"></i> 긴급 공지 확인
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center py-16 px-4 md:px-8">

      {/* Demo switcher bar — only shown when not URL-driven */}
      {!lockedError && (
        <div className="bg-white/70 backdrop-blur-md p-2 rounded-2xl flex flex-wrap items-center gap-2 mb-12 border border-slate-200/60 shadow-lg select-none animate-[fadeIn_0.3s_ease]">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3 pr-3 border-r border-slate-200 hidden sm:inline">
            에러 페이지 데모
          </span>
          {(['404', '500', '503'] as const).map(type => (
            <button
              key={type}
              type="button"
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeError === type
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
              onClick={() => setActiveError(type)}
            >
              {type === '404' && '🚫 404 Not Found'}
              {type === '500' && '🔥 500 Server Error'}
              {type === '503' && '🛠️ 503 Maintenance'}
            </button>
          ))}
        </div>
      )}

      {/* Main card */}
      <div
        className="w-full bg-white border border-slate-200/80 shadow-2xl relative overflow-hidden animate-[zoomIn_0.25s_ease] flex flex-col items-center"
        style={{ borderRadius: '40px', maxWidth: '780px', padding: 'clamp(2.5rem, 6vw, 5rem)' }}
      >
        {/* Top gradient accent bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary" />

        {/* Corner decorations */}
        <div className="absolute top-6 right-6 w-24 h-24 rounded-full bg-gradient-to-br from-primary/5 to-secondary/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-6 left-6 w-32 h-32 rounded-full bg-gradient-to-tr from-secondary/5 to-primary/10 blur-2xl pointer-events-none" />

        {renderErrorContent()}
      </div>
    </div>
  );
};
