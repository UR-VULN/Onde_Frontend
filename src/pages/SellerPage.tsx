import React, { useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import { SellerDashboardPanel } from '@/components/seller/SellerDashboardPanel';
import { SellerStayPanel } from '@/components/seller/SellerStayPanel';
import { SellerCarPanel } from '@/components/seller/SellerCarPanel';
import { SellerStatPanel } from '@/components/seller/SellerStatPanel';
import { SellerAccountPanel } from '@/components/seller/SellerAccountPanel';
import { SellerSchedulePanel } from '@/components/flight/SellerSchedulePanel';
import { BackOfficeLayout } from '@/components/layout/BackOfficeLayout';

type SellerTab = 'dashboard' | 'stay' | 'car' | 'flight' | 'stat' | 'account';

const SIDEBAR_ITEMS = [
  { id: 'dashboard', icon: 'fa-solid fa-chart-line',      label: '종합 대시보드'      },
  { id: 'stay',      icon: 'fa-solid fa-hotel',           label: '숙소 재고'          },
  { id: 'car',       icon: 'fa-solid fa-car',             label: '렌터카 재고'        },
  { id: 'flight',    icon: 'fa-solid fa-plane',           label: '항공 상품'          },
  { id: 'stat',      icon: 'fa-solid fa-money-bill-wave', label: '매출 및 정산 대금'   },
  { id: 'account',   icon: 'fa-solid fa-id-card',         label: '계정 및 계좌 설정'   },
];

export const SellerPage: React.FC = () => {
  const { username } = useTravelStore();
  const [activeTab, setActiveTab] = useState<SellerTab>('dashboard');

  const renderPanel = () => {
    switch (activeTab) {
      case 'dashboard': return <SellerDashboardPanel onTabChange={(tab) => setActiveTab(tab as SellerTab)} />;
      case 'stay':      return <SellerStayPanel />;
      case 'car':       return <SellerCarPanel />;
      case 'flight':    return <SellerSchedulePanel />;
      case 'stat':      return <SellerStatPanel />;
      case 'account':   return <SellerAccountPanel />;
      default:          return <SellerDashboardPanel onTabChange={(tab) => setActiveTab(tab as SellerTab)} />;
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
    >
      {renderPanel()}
    </BackOfficeLayout>
  );
};


