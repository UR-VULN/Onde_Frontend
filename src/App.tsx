import React from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { WelcomeModal } from '@/components/ui/WelcomeModal';
import { AuthModal } from '@/components/auth/AuthModal';

// 9 Standard Pages
import { StayPage } from '@/pages/StayPage';
import { FlightPage } from '@/pages/FlightPage';
import { CarPage } from '@/pages/CarPage';
import { InsurancePage } from '@/pages/InsurancePage';
import { MapPage } from '@/pages/MapPage';
import { FeedPage } from '@/pages/FeedPage';
import { MyPage } from '@/pages/MyPage';
import { SellerPage } from '@/pages/SellerPage';
import { AdminPage } from '@/pages/AdminPage';

const App: React.FC = () => {
  const { activePortal, activePage, isAuthModalOpen } = useTravelStore();

  const renderPage = () => {
    // 1. Seller Portal (Extranet)
    if (activePortal === 'sell') {
      return <SellerPage />;
    }

    // 2. Admin & Customer Portals (Enclosed in a common centered page-container wrapper)
    return (
      <div className="page-container active w-full">
        {(() => {
          if (activePortal === 'adm') {
            return <AdminPage />;
          }

          switch (activePage) {
            case 'home':
              return <StayPage />;
            case 'flight':
              return <FlightPage />;
            case 'car':
              return <CarPage />;
            case 'ins':
              return <InsurancePage />;
            case 'map':
              return <MapPage />;
            case 'feed':
              return <FeedPage />;
            case 'mypage':
              return <MyPage />;
            default:
              return <StayPage />;
          }
        })()}
      </div>
    );
  };

  return (
    <MainLayout>
      {/* Dynamic Swapped Pages */}
      {renderPage()}

      {/* Common Shared Global UI Containers */}
      <ToastContainer />
      <ConfirmModal />
      <WelcomeModal />
      {isAuthModalOpen && <AuthModal />}

      {/* Global CSS Transition Animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px) translateY(0);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes zoomIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </MainLayout>
  );
};

export default App;