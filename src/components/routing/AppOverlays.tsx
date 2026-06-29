import React from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { WelcomeModal } from '@/components/ui/WelcomeModal';
import { SellerPendingModal } from '@/components/ui/SellerPendingModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { AuthBootstrap } from '@/components/routing/AuthBootstrap';

/** 전역 토스트·모달 (고객/백오피스 공통) */
export const AppOverlays: React.FC = () => {
  const isAuthModalOpen = useTravelStore((s) => s.isAuthModalOpen);

  return (
    <>
      <AuthBootstrap />
      <ToastContainer />
      <ConfirmModal />
      <WelcomeModal />
      <SellerPendingModal />
      {isAuthModalOpen && <AuthModal />}
    </>
  );
};
