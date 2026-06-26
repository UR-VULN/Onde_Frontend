import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { isErrorPagePath } from '@/utils/errorNavigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { AppOverlays } from '@/components/routing/AppOverlays';
import { RequireAuth } from '@/components/routing/RequireAuth';
import { RequireRole } from '@/components/routing/RequireRole';
import { ErrorPageLayout } from '@/components/routing/ErrorPageLayout';

import { StayPage } from '@/pages/StayPage';
import { FlightPage } from '@/pages/FlightPage';
import { CarPage } from '@/pages/CarPage';
import { InsurancePage } from '@/pages/InsurancePage';
import { MapPage } from '@/pages/MapPage';
import { FeedPage } from '@/pages/FeedPage';
import { MyPage } from '@/pages/MyPage';
import { PaymentPage } from '@/pages/PaymentPage';
import { PaymentCallbackPage } from '@/pages/PaymentCallbackPage';
import { SellerPage } from '@/pages/SellerPage';
import { AdminPage } from '@/pages/AdminPage';
import { AdminLoginPage } from '@/pages/AdminLoginPage';
import { ErrorPage } from '@/pages/ErrorPage';
import { useTravelStore } from '@/store/useTravelStore';
import { EmailSignupPage } from '@/pages/EmailSignupPage';

const ERROR_ROUTES = (
  <>
    <Route path="/401" element={<ErrorPageLayout><ErrorPage errorCode="401" /></ErrorPageLayout>} />
    <Route path="/403" element={<ErrorPageLayout><ErrorPage errorCode="403" /></ErrorPageLayout>} />
    <Route path="/404" element={<ErrorPageLayout><ErrorPage errorCode="404" /></ErrorPageLayout>} />
    <Route path="/500" element={<ErrorPageLayout><ErrorPage errorCode="500" /></ErrorPageLayout>} />
    <Route path="/503" element={<ErrorPageLayout><ErrorPage errorCode="503" /></ErrorPageLayout>} />
  </>
);

// 소셜 로그인 리다이렉트 핸들러 컴포넌트 (기존 USER 권한 로그인을 처리)
const OAuth2RedirectHandler: React.FC = () => {
  const navigate = useNavigate();
  const { login, addToast } = useTravelStore();

  useEffect(() => {
    // 백엔드 세션/쿠키 연동을 포함한 실제 유저 로그인 처리 부분
    login("소셜유저", "cust");
    addToast("⚡ 소셜 로그인이 성공적으로 완료되었습니다!", "success");
    
    // 로그인이 완료되면 메인 홈('/')으로 리다이렉트
    navigate('/', { replace: true });
  }, [navigate, login, addToast]);

  return <div className="flex h-screen items-center justify-center">로그인 처리 중입니다...</div>;
};

const isAdminDomain = (host: string, pathname: string) => {
  if (host === 'localhost' || host === '127.0.0.1') {
    return pathname.startsWith('/admin');
  }
  return host.startsWith('rookies.') || host.startsWith('admin.') || host.includes('admin');
};

const App: React.FC = () => {
  const { pathname } = useLocation();
  const host = window.location.hostname;
  const isHoldingAdmin = isAdminDomain(host, pathname);

  if (isErrorPagePath(pathname)) {
    return (
      <>
        <Routes>
          {ERROR_ROUTES}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
        <AppOverlays />
      </>
    );
  }

  // 관리자 전용 도메인 (또는 로컬 개발 환경에서 /admin 접근 시)
  if (isHoldingAdmin) {
    return (
      <>
        <Routes>
          {/* 어드민 도메인의 루트(/) 접속 시 관리자 페이지로 이동 (비로그인 시 /admin/login으로 자동 리다이렉트) */}
          <Route
            path="/"
            element={
              <RequireRole guard="admin">
                <AdminPage />
              </RequireRole>
            }
          />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin/settlement"
            element={
              <RequireRole guard="admin">
                <AdminPage />
              </RequireRole>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireRole guard="admin">
                <AdminPage />
              </RequireRole>
            }
          />
          {ERROR_ROUTES}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
        <AppOverlays />
      </>
    );
  }

  // 일반 도메인 (사용자 및 판매자)
  return (
    <>
      <Routes>
        {/* 소셜 로그인 성공(기존 가입 유저) 리다이렉트 핸들러 라우트 */}
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

        {/* 최초 소셜 가입자(GUEST)를 위한 이메일 추가 수집 페이지 라우트 */}
        <Route path="/signup/email" element={<EmailSignupPage />} />

        {/* 고객 포탈 */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<StayPage />} />
          <Route path="/flight" element={<FlightPage />} />
          <Route path="/car" element={<CarPage />} />
          <Route path="/insurance" element={<InsurancePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route
            path="/mypage"
            element={
              <RequireAuth>
                <MyPage />
              </RequireAuth>
            }
          />
          <Route
            path="/payment"
            element={
              <RequireAuth>
                <PaymentPage />
              </RequireAuth>
            }
          />
          <Route
            path="/payment/callback"
            element={
              <RequireAuth>
                <PaymentCallbackPage />
              </RequireAuth>
            }
          />
        </Route>

        {/* 판매자 포탈 — URL + 역할 가드 */}
        <Route
          path="/seller"
          element={
            <RequireRole guard="seller">
              <SellerPage />
            </RequireRole>
          }
        />

        {ERROR_ROUTES}

        {/* 일반 도메인에서는 관리자 라우트가 차단되어 404로 이동하게 됨 */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>

      <AppOverlays />

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes shrinkWidth {
          from { width: 100%; }
          to   { width: 0%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes zoomIn {
          from { transform: scale(0.95); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default App;