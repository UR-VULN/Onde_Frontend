import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTravelStore } from '@/store/useTravelStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { WelcomeModal } from '@/components/ui/WelcomeModal';
import { SellerPendingModal } from '@/components/ui/SellerPendingModal';
import { AuthModal } from '@/components/auth/AuthModal';

// Pages
import { StayPage } from '@/pages/StayPage';
import { FlightPage } from '@/pages/FlightPage';
import { CarPage } from '@/pages/CarPage';
import { InsurancePage } from '@/pages/InsurancePage';
import { MapPage } from '@/pages/MapPage';
import { FeedPage } from '@/pages/FeedPage';
import { MyPage } from '@/pages/MyPage';
import { SellerPage } from '@/pages/SellerPage';
import { AdminPage } from '@/pages/AdminPage';
import { ErrorPage } from '@/pages/ErrorPage';

const App: React.FC = () => {
  const { activePortal, isAuthModalOpen } = useTravelStore();

  // Seller / Admin portals bypass the URL router entirely
  if (activePortal === 'sell') {
    return (
      <>
        <SellerPage />
        <ToastContainer />
        <ConfirmModal />
        {isAuthModalOpen && <AuthModal />}
      </>
    );
  }

  if (activePortal === 'adm') {
    return (
      <>
        <AdminPage />
        <ToastContainer />
        <ConfirmModal />
        {isAuthModalOpen && <AuthModal />}
      </>
    );
  }

  return (
    <>
      <Routes>
        {/* Main app routes — wrapped in MainLayout (Header + Hero + Footer) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<StayPage />} />
          <Route path="/flight" element={<FlightPage />} />
          <Route path="/car" element={<CarPage />} />
          <Route path="/insurance" element={<InsurancePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/mypage" element={<MyPage />} />
        </Route>

        {/* Standalone error pages — no MainLayout */}
        <Route
          path="/404"
          element={
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8faff 0%, #eef2ff 50%, #f0fdf4 100%)' }}>
              <ErrorPage errorCode="404" />
            </div>
          }
        />
        <Route
          path="/500"
          element={
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8faff 0%, #eef2ff 50%, #f0fdf4 100%)' }}>
              <ErrorPage errorCode="500" />
            </div>
          }
        />
        <Route
          path="/503"
          element={
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8faff 0%, #eef2ff 50%, #f0fdf4 100%)' }}>
              <ErrorPage errorCode="503" />
            </div>
          }
        />

        {/* Catch-all: unknown paths → 404 */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>

      {/* Global UI overlays */}
      <ToastContainer />
      <ConfirmModal />
      <WelcomeModal />
      <SellerPendingModal />
      {isAuthModalOpen && <AuthModal />}

      {/* Global CSS Transition Animations */}
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