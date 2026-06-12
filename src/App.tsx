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
import { ErrorPage } from '@/pages/ErrorPage';
import { useTravelStore } from '@/store/useTravelStore';

const ERROR_ROUTES = (
  <>
    <Route path="/401" element={<ErrorPageLayout><ErrorPage errorCode="401" /></ErrorPageLayout>} />
    <Route path="/403" element={<ErrorPageLayout><ErrorPage errorCode="403" /></ErrorPageLayout>} />
    <Route path="/404" element={<ErrorPageLayout><ErrorPage errorCode="404" /></ErrorPageLayout>} />
    <Route path="/500" element={<ErrorPageLayout><ErrorPage errorCode="500" /></ErrorPageLayout>} />
    <Route path="/503" element={<ErrorPageLayout><ErrorPage errorCode="503" /></ErrorPageLayout>} />
  </>
);

// 리다이렉트 핸들러 컴포넌트
const OAuth2RedirectHandler: React.FC = () => {
  const navigate = useNavigate();
  const { login, addToast } = useTravelStore();

  useEffect(() => {
    // 백엔드 API 연결 전 임시 로그인 처리
    login("소셜유저", "cust");
    addToast("⚡ 소셜 로그인이 성공적으로 완료되었습니다!", "success");
    
    // 처리가 끝나면 메인 홈('/')으로 이동시키며, 뒤로가기 기록을 남기지 않음(replace: true)
    navigate('/', { replace: true });
  }, [navigate, login, addToast]);

  return <div className="flex h-screen items-center justify-center">로그인 처리 중입니다...</div>;
};

const App: React.FC = () => {
  const { pathname } = useLocation();

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

  return (
    <>
      <Routes>
        {/* 소셜 로그인 리다이렉트 경로를 라우터에 등록 */}
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

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

        {/* 관리자 포탈 — URL + 역할 가드 */}
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