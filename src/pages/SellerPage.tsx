import React, { useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import { SellerStayCarPanel } from '@/components/seller/SellerStayCarPanel';
import { SellerStatPanel } from '@/components/seller/SellerStatPanel';
import { SellerQAPanel } from '@/components/seller/SellerQAPanel';
import { SellerAccountPanel } from '@/components/seller/SellerAccountPanel';
import { SellerSchedulePanel } from '@/components/flight/SellerSchedulePanel';
import { BackOfficeLayout } from '@/components/layout/BackOfficeLayout';

type SellerTab = 'stay' | 'flight' | 'stat' | 'qa' | 'account';

const SIDEBAR_ITEMS = [
  { id: 'stay',    icon: 'fa-solid fa-hotel',          label: '숙소/렌터카 재고',      team: 'C팀' },
  { id: 'flight',  icon: 'fa-solid fa-plane',           label: '항공/보험 상품',        team: 'B팀' },
  { id: 'stat',    icon: 'fa-solid fa-chart-line',      label: '매출 및 정산 대금',     team: 'D팀' },
  { id: 'qa',      icon: 'fa-solid fa-reply-all',       label: '문의 및 리뷰',          team: 'E팀' },
  { id: 'account', icon: 'fa-solid fa-id-card',         label: '계정 및 계좌 설정',     team: 'A팀' },
];

export const SellerPage: React.FC = () => {
  const { username, logout } = useTravelStore();
  const [activeTab, setActiveTab] = useState<SellerTab>('stay');

  const renderPanel = () => {
    switch (activeTab) {
      case 'stay':    return <SellerStayCarPanel />;
      case 'flight':  return <SellerSchedulePanel />;
      case 'stat':    return <SellerStatPanel />;
      case 'qa':      return <SellerQAPanel />;
      case 'account': return <SellerAccountPanel />;
      default:        return <SellerStayCarPanel />;
    }
  };

  return (
    <BackOfficeLayout
      portalName="파트너 포탈"
      portalType="sell"
      sidebarItems={SIDEBAR_ITEMS}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as SellerTab)}
      username={username}
      logout={logout}
    >
      {renderPanel()}
    </BackOfficeLayout>
  );
};
