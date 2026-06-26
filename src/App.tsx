import React, { useEffect } from 'react';

import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { isErrorPagePath } from '@/utils/errorNavigation';

import { MainLayout } from '@/components/layout/MainLayout';

import { AppOverlays } from '@/components/routing/AppOverlays';

import { RequireAuth } from '@/components/routing/RequireAuth';

import { RequireRole } from '@/components/routing/RequireRole';

import { ErrorPageLayout } from '@/components/routing/ErrorPageLayout';
import { SeoRobotsGuard } from '@/components/routing/SeoRobotsGuard';

import {

  getAdminHomePath,

  getAdminLoginPath,

  getAdminSettlementPath,

  isAdminPortalContext,

} from '@/constants/adminPortal';



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
import { restoreSessionFromServer } from '@/utils/authSession';
import { getDefaultPathForRole } from '@/utils/memberRole';



const ERROR_ROUTES = (

  <>

    <Route path="/401" element={<ErrorPageLayout><ErrorPage errorCode="401" /></ErrorPageLayout>} />

    <Route path="/403" element={<ErrorPageLayout><ErrorPage errorCode="403" /></ErrorPageLayout>} />

    <Route path="/404" element={<ErrorPageLayout><ErrorPage errorCode="404" /></ErrorPageLayout>} />

    <Route path="/500" element={<ErrorPageLayout><ErrorPage errorCode="500" /></ErrorPageLayout>} />

    <Route path="/503" element={<ErrorPageLayout><ErrorPage errorCode="503" /></ErrorPageLayout>} />

  </>

);



const OAuth2RedirectHandler: React.FC = () => {

  const navigate = useNavigate();

  const addToast = useTravelStore((s) => s.addToast);



  useEffect(() => {

    void restoreSessionFromServer().then((ok) => {

      if (ok) {

        const role = useTravelStore.getState().memberRole ?? 'USER';

        addToast('⚡ 소셜 로그인이 성공적으로 완료되었습니다!', 'success');

        navigate(getDefaultPathForRole(role), { replace: true });

        return;

      }

      addToast('소셜 로그인 처리에 실패했습니다. 다시 시도해 주세요.', 'warning');

      navigate('/', { replace: true });

    });

  }, [navigate, addToast]);



  return <div className="flex h-screen items-center justify-center">로그인 처리 중입니다...</div>;

};



const App: React.FC = () => {

  const { pathname } = useLocation();

  const host = window.location.hostname;

  const isHoldingAdmin = isAdminPortalContext(host, pathname);

  const adminLoginPath = getAdminLoginPath(host);

  const adminHomePath = getAdminHomePath(host);

  const adminSettlementPath = getAdminSettlementPath(host);



  if (isErrorPagePath(pathname)) {

    return (

      <>

        <SeoRobotsGuard />

        <Routes>

          {ERROR_ROUTES}

          <Route path="*" element={<Navigate to="/404" replace />} />

        </Routes>

        <AppOverlays />

      </>

    );

  }



  if (isHoldingAdmin) {

    return (

      <>

        <SeoRobotsGuard />

        <Routes>

          <Route

            path={adminHomePath}

            element={

              <RequireRole guard="admin">

                <AdminPage />

              </RequireRole>

            }

          />

          <Route path={adminLoginPath} element={<AdminLoginPage />} />

          <Route

            path={adminSettlementPath}

            element={

              <RequireRole guard="admin">

                <AdminPage />

              </RequireRole>

            }

          />

          <Route path="/admin/*" element={<Navigate to="/404" replace />} />

          {ERROR_ROUTES}

          <Route path="*" element={<Navigate to="/404" replace />} />

        </Routes>

        <AppOverlays />

      </>

    );

  }



  return (

    <>

      <SeoRobotsGuard />

      <Routes>

        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />



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



        <Route

          path="/seller"

          element={

            <RequireRole guard="seller">

              <SellerPage />

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

